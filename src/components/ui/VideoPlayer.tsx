import {
  ChevronDown,
  Maximize,
  Pause,
  Play,
  RotateCcw,
  Settings,
  Volume2,
  VolumeX
} from "lucide-react";
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState
} from "react";

import Hls from "hls.js";

interface VideoPlayerProps {
  src: string;
  poster?: string;
  thumbnailUrl?: string | undefined;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  controls?: boolean;
  className?: string;
  startLevel?: number;
  lockQuality?: boolean;
  showQualityInfo?: boolean;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  onLoadedData?: () => void;
  onError?: (error: string) => void;
}

interface QualityLevel {
  height: number;
  width: number;
  name: string;
  bitrate: number;
  index: number;
}

export const VideoPlayer = forwardRef<
  { videoRef: React.RefObject<HTMLVideoElement> },
  VideoPlayerProps
>(
  (
    {
      src,
      poster,
      thumbnailUrl,
      autoPlay = true,
      muted = true,
      loop = true,
      controls = true,
      className = "",
      startLevel = -1,
      lockQuality = false,
      showQualityInfo = false,
      onPlay,
      onPause,
      onEnded,
      onLoadedData,
      onError
    },
    ref
  ) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const hlsRef = useRef<Hls | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [playing, setPlaying] = useState(autoPlay);
    const [videoMuted, setVideoMuted] = useState(muted);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [buffered, setBuffered] = useState(0);
    const [showControls, setShowControls] = useState(false);
    const [hideControlsTimeout, setHideControlsTimeout] =
      useState<NodeJS.Timeout | null>(null);
    const [qualityLevels, setQualityLevels] = useState<QualityLevel[]>([]);
    const [currentQuality, setCurrentQuality] = useState<number>(-1);
    const [showQualityMenu, setShowQualityMenu] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [currentQualityInfo, setCurrentQualityInfo] = useState<string>("");

    // Добавим флаг для отслеживания, было ли уже залогировано сообщение для этого src
    const hasLoggedRef = useRef(false);

    // Экспортируем videoRef через useImperativeHandle
    useImperativeHandle(
      ref,
      () => ({
        videoRef
      }),
      []
    );

    // Мемоизируем компонент для предотвращения лишних ререндеров
    const instanceKey = useRef(
      `video-${src.split("/").pop()}-${Date.now()}`
    ).current;

    // Оптимизация логирования для повышения производительности
    const isDevMode = process.env.NODE_ENV !== "production";

    // Функция для форматирования времени в мм:сс
    const formatTime = (seconds: number): string => {
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    // Обработчик движения мыши для показа/скрытия элементов управления
    const handleMouseMove = useCallback(() => {
      setShowControls(true);

      if (hideControlsTimeout) {
        clearTimeout(hideControlsTimeout);
      }

      const timeout = setTimeout(() => {
        if (playing) {
          setShowControls(false);
        }
      }, 3000);

      setHideControlsTimeout(timeout);
    }, [playing, hideControlsTimeout]);

    // Обработчик ухода мыши для скрытия элементов управления
    const handleMouseLeave = useCallback(() => {
      if (hideControlsTimeout) {
        clearTimeout(hideControlsTimeout);
      }

      if (playing) {
        setShowControls(false);
      }
    }, [playing, hideControlsTimeout]);

    // Переключение плеера на полный экран
    const toggleFullscreen = useCallback(() => {
      if (!containerRef.current) return;

      if (!document.fullscreenElement) {
        containerRef.current
          .requestFullscreen()
          .then(() => {
            setIsFullscreen(true);
          })
          .catch(err => {
            console.error(`Ошибка полноэкранного режима: ${err.message}`);
          });
      } else {
        document
          .exitFullscreen()
          .then(() => {
            setIsFullscreen(false);
          })
          .catch(err => {
            console.error(
              `Ошибка выхода из полноэкранного режима: ${err.message}`
            );
          });
      }
    }, []);

    // Переключение воспроизведения/паузы
    const togglePlay = useCallback(() => {
      const video = videoRef.current;
      if (!video) return;

      if (video.paused) {
        video
          .play()
          .then(() => {
            setPlaying(true);
          })
          .catch(err => {
            console.error("Ошибка воспроизведения:", err);
          });
      } else {
        video.pause();
        setPlaying(false);
      }
    }, []);

    // Переключение звука
    const toggleMute = useCallback(() => {
      const video = videoRef.current;
      if (!video) return;

      video.muted = !video.muted;
      setVideoMuted(video.muted);
    }, []);

    // Изменение времени воспроизведения
    const handleTimeChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const video = videoRef.current;
        if (!video) return;

        const newTime = parseFloat(e.target.value);
        video.currentTime = newTime;
        setCurrentTime(newTime);
      },
      []
    );

    // Выбор качества воспроизведения
    const selectQuality = useCallback((levelIndex: number) => {
      if (!hlsRef.current) return;

      // Устанавливаем выбранное качество
      hlsRef.current.currentLevel = levelIndex;

      // Если выбрано конкретное значение (не авто), устанавливаем lockQuality в true
      if (levelIndex !== -1) {
        hlsRef.current.autoLevelCapping = levelIndex;
        hlsRef.current.loadLevel = levelIndex;
        hlsRef.current.nextLevel = levelIndex;
      } else {
        // Для авто-режима снимаем ограничения
        hlsRef.current.autoLevelCapping = -1;
      }

      setCurrentQuality(levelIndex);
      setShowQualityMenu(false);
    }, []);

    // Обновляем обработчик ошибок, чтобы вызывать внешний обработчик
    const handleError = useCallback(
      (e: string) => {
        console.error("Ошибка видеоплеера:", e);
        setError(e);
        setLoading(false);
        // Вызываем внешний обработчик ошибок если он предоставлен
        if (onError) {
          onError(e);
        }
      },
      [onError]
    );

    // Эффект для инициализации Hls.js
    useEffect(() => {
      const video = videoRef.current;
      if (!video) return;

      // Для предотвращения многократных обновлений
      let shouldUpdateState = true;

      // Очистка предыдущего экземпляра HLS
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }

      // Сбрасываем ошибки при изменении источника
      setError(null);
      setLoading(true);
      setCurrentTime(0);
      setDuration(0);
      setBuffered(0);

      // Выносим инициализацию qualityLevels в отдельную переменную
      // вместо установки через setState, чтобы избежать дополнительных рендеров
      let newQualityLevels: QualityLevel[] = [];
      let newCurrentQuality = startLevel;

      // Проверяем, является ли источник HLS
      const isHlsSource = src.includes(".m3u8");

      if (isHlsSource && Hls.isSupported()) {
        // Логируем только в разработке и только один раз
        if (isDevMode && !hasLoggedRef.current) {
          console.log("Используем HLS.js для", src.split("/").pop());
          hasLoggedRef.current = true;
        }

        const hls = new Hls({
          maxBufferLength: 30,
          maxMaxBufferLength: 60,
          startLevel,
          debug: false,
          // Если lockQuality установлен в true и startLevel задан, запрещаем автоматическое переключение
          capLevelToPlayerSize: !lockQuality || startLevel === -1,
          // Дополнительные опции для ускорения загрузки
          lowLatencyMode: false,
          backBufferLength: 30,
          fragLoadingTimeOut: 20000,
          manifestLoadingTimeOut: 10000
        });

        // Оптимизированная обработка ошибок
        hls.on(Hls.Events.ERROR, (event, data) => {
          if (!shouldUpdateState) return;

          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                // Пробуем восстановить соединение
                if (isDevMode) {
                  console.error(
                    "HLS сетевая ошибка, пробуем восстановить",
                    data
                  );
                }
                hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                // Пробуем восстановить воспроизведение
                if (isDevMode) {
                  console.error("HLS ошибка медиа, пробуем восстановить", data);
                }
                hls.recoverMediaError();
                break;
              default:
                // Неустранимая ошибка
                if (isDevMode) {
                  console.error("HLS фатальная ошибка:", data);
                }
                handleError(`HLS ошибка: ${data.details}`);
                hls.destroy();
                break;
            }
          }
        });

        // Оптимизируем обработчик MANIFEST_PARSED для избежания бесконечного цикла обновления
        hls.once(Hls.Events.MANIFEST_PARSED, (event, data) => {
          if (!shouldUpdateState) return;

          // Логируем только один раз при загрузке манифеста, в продакшене отключаем
          if (isDevMode) {
            console.log(
              "HLS манифест загружен:",
              src.split("/").pop(),
              "Видео имеет постер:",
              Boolean(thumbnailUrl || poster)
            );
          }

          // Устанавливаем качество локально, без вызова setState для каждого уровня
          newQualityLevels = data.levels
            .map((level, index) => ({
              height: level.height,
              width: level.width,
              bitrate: level.bitrate,
              name: level.height ? `${level.height}p` : `Уровень ${index}`,
              index
            }))
            .sort((a, b) => b.height - a.height);

          // Если задано фиксированное качество и startLevel отличается от -1, устанавливаем его
          if (lockQuality && startLevel !== -1) {
            // Фиксируем выбранный уровень качества
            hls.currentLevel = startLevel;
            hls.autoLevelCapping = startLevel;
            // Для дополнительной уверенности отключаем автоматическое переключение качества
            hls.loadLevel = startLevel;
            hls.nextLevel = startLevel;
          }

          // Устанавливаем состояния однократно, чтобы избежать цикла обновлений
          if (shouldUpdateState) {
            setQualityLevels(newQualityLevels);
            setCurrentQuality(
              lockQuality && startLevel !== -1 ? startLevel : hls.currentLevel
            );
            setLoading(false);
          }

          // Устанавливаем постер непосредственно на видео-элемент
          if (video && (thumbnailUrl || poster)) {
            video.poster = thumbnailUrl || poster || "";
            if (isDevMode) {
              console.log(
                "Установлен постер для видео:",
                thumbnailUrl || poster
              );
            }
          }

          if (autoPlay && shouldUpdateState) {
            // Добавляем небольшую задержку перед воспроизведением, чтобы дать время загрузить видео
            setTimeout(() => {
              if (video && shouldUpdateState) {
                video.play().catch(err => {
                  if (isDevMode) {
                    console.error("Ошибка автовоспроизведения:", err);
                  }
                  if (shouldUpdateState) {
                    setPlaying(false);
                  }
                });
              }
            }, 100);
          }
        });

        // Уменьшаем частоту обновлений состояния при смене уровня качества
        hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
          if (!shouldUpdateState) return;

          // Если задано фиксированное качество, не позволяем HLS автоматически менять уровень
          if (lockQuality && startLevel !== -1) {
            if (hls.currentLevel !== startLevel) {
              hls.currentLevel = startLevel;
            }
            return;
          }

          // Обновляем текущее качество только если оно изменилось
          if (newCurrentQuality !== data.level) {
            newCurrentQuality = data.level;
            if (shouldUpdateState) {
              setCurrentQuality(data.level);
            }
          }
        });

        // Загружаем источник только один раз
        hls.loadSource(src);
        hls.attachMedia(video);

        hlsRef.current = hls;

        return () => {
          shouldUpdateState = false;
          hls.destroy();
        };
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        // Нативная поддержка HLS в Safari
        if (isDevMode && !hasLoggedRef.current) {
          console.log(
            "Используем нативную поддержку HLS для:",
            src.split("/").pop()
          );
          hasLoggedRef.current = true;
        }
        video.src = src;

        if (autoPlay) {
          video.play().catch(err => {
            if (isDevMode) {
              console.error("Ошибка автовоспроизведения:", err);
            }
            if (shouldUpdateState) {
              handleError(`Ошибка автовоспроизведения: ${err.message}`);
              setPlaying(false);
            }
          });
        }

        if (shouldUpdateState) {
          setLoading(false);
        }
      } else {
        // Обычное видео
        if (isDevMode && !hasLoggedRef.current) {
          console.log(
            "Используем стандартное воспроизведение для:",
            src.split("/").pop()
          );
          hasLoggedRef.current = true;
        }
        video.src = src;

        if (autoPlay) {
          // Добавляем небольшую задержку перед воспроизведением
          setTimeout(() => {
            if (!shouldUpdateState) return;

            // Проверяем, не был ли изменен src с момента начала таймаута
            if (video.src === src) {
              video.play().catch(err => {
                if (isDevMode) {
                  console.warn("Ошибка автовоспроизведения:", err);
                }
                if (shouldUpdateState && err.name !== "AbortError") {
                  // Игнорируем AbortError, так как он возникает при смене src
                  handleError(`Ошибка автовоспроизведения: ${err.message}`);
                  setPlaying(false);
                }
              });
            }
          }, 100);
        }

        if (shouldUpdateState) {
          setLoading(false);
        }
      }

      // Обработчики событий видео
      const handleVideoError = () => {
        if (!shouldUpdateState) return;

        if (video.error) {
          handleError(
            `Ошибка видео: ${video.error.message} (код ${video.error.code})`
          );
        }
      };

      const handleTimeUpdate = () => {
        if (!shouldUpdateState) return;
        setCurrentTime(video.currentTime);
      };

      const handleDurationChange = () => {
        if (!shouldUpdateState) return;
        setDuration(video.duration);
      };

      const handleProgress = () => {
        if (!shouldUpdateState || video.buffered.length === 0) return;
        setBuffered(video.buffered.end(video.buffered.length - 1));
      };

      const handleEnded = () => {
        if (!shouldUpdateState) return;

        setPlaying(false);
        // Вызываем внешний обработчик события окончания воспроизведения
        if (onEnded) {
          onEnded();
        }
        if (loop) {
          video
            .play()
            .then(() => {
              if (shouldUpdateState) {
                setPlaying(true);
              }
            })
            .catch(err => {
              if (isDevMode) {
                console.error("Ошибка перезапуска видео:", err);
              }
            });
        }
      };

      const handlePlay = () => {
        if (!shouldUpdateState) return;

        setPlaying(true);
        // Вызываем внешний обработчик события начала воспроизведения
        if (onPlay) {
          onPlay();
        }
      };

      const handlePause = () => {
        if (!shouldUpdateState) return;

        setPlaying(false);
        // Вызываем внешний обработчик события паузы
        if (onPause) {
          onPause();
        }
      };

      const handleWaiting = () => {
        if (!shouldUpdateState) return;
        setLoading(true);
      };

      const handleCanPlay = () => {
        if (!shouldUpdateState) return;
        setLoading(false);
      };

      const handleLoadedData = () => {
        if (!shouldUpdateState) return;

        setLoading(false);
        // Важно - сразу скрываем индикатор загрузки при получении данных
        setTimeout(() => {
          if (shouldUpdateState) {
            setLoading(false);
          }
        }, 100);
        // Вызываем внешний обработчик события загрузки видео
        if (onLoadedData) {
          onLoadedData();
        }
      };

      // Добавляем обработчики
      video.addEventListener("error", handleVideoError);
      video.addEventListener("timeupdate", handleTimeUpdate);
      video.addEventListener("durationchange", handleDurationChange);
      video.addEventListener("progress", handleProgress);
      video.addEventListener("ended", handleEnded);
      video.addEventListener("play", handlePlay);
      video.addEventListener("pause", handlePause);
      video.addEventListener("waiting", handleWaiting);
      video.addEventListener("canplay", handleCanPlay);
      video.addEventListener("loadeddata", handleLoadedData);

      // Удаляем обработчики при размонтировании
      return () => {
        shouldUpdateState = false;

        video.removeEventListener("error", handleVideoError);
        video.removeEventListener("timeupdate", handleTimeUpdate);
        video.removeEventListener("durationchange", handleDurationChange);
        video.removeEventListener("progress", handleProgress);
        video.removeEventListener("ended", handleEnded);
        video.removeEventListener("play", handlePlay);
        video.removeEventListener("pause", handlePause);
        video.removeEventListener("waiting", handleWaiting);
        video.removeEventListener("canplay", handleCanPlay);
        video.removeEventListener("loadeddata", handleLoadedData);

        // Сбрасываем флаг логирования при размонтировании
        hasLoggedRef.current = false;
      };
    }, [
      src,
      autoPlay,
      loop,
      handleError,
      onPlay,
      onPause,
      onEnded,
      onLoadedData
    ]);

    // Эффект для обработки событий полноэкранного режима
    useEffect(() => {
      const handleFullscreenChange = () => {
        setIsFullscreen(!!document.fullscreenElement);
      };

      document.addEventListener("fullscreenchange", handleFullscreenChange);

      return () => {
        document.removeEventListener(
          "fullscreenchange",
          handleFullscreenChange
        );
      };
    }, []);

    // Добавляем обработчик события смены уровня качества
    useEffect(() => {
      if (!hlsRef.current || !isDevMode) return;

      const updateQualityInfo = () => {
        if (
          !hlsRef.current ||
          !hlsRef.current.levels ||
          !Array.isArray(hlsRef.current.levels)
        )
          return;
        const level = hlsRef.current.currentLevel;
        if (level >= 0 && hlsRef.current.levels[level]) {
          const { height, width } = hlsRef.current.levels[level];
          if (height && width) {
            setCurrentQualityInfo(`${width}x${height}`);
          } else {
            setCurrentQualityInfo(`Уровень ${level}`);
          }
        } else if (level === -1) {
          setCurrentQualityInfo("Автоматически");
        }
      };

      hlsRef.current.on(Hls.Events.LEVEL_SWITCHED, updateQualityInfo);

      // Вызываем сразу для инициализации
      if (hlsRef.current.currentLevel !== undefined) {
        updateQualityInfo();
      }

      return () => {
        if (hlsRef.current) {
          hlsRef.current.off(Hls.Events.LEVEL_SWITCHED, updateQualityInfo);
        }
      };
    }, [hlsRef.current]);

    return (
      <div
        ref={containerRef}
        className={`relative overflow-hidden w-full h-full ${className}`}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Добавляем индикатор качества */}
        {showQualityInfo && currentQualityInfo && (
          <div className="absolute top-2 right-2 px-2 py-1 bg-black/70 text-white text-xs rounded-md z-50">
            {currentQualityInfo}
          </div>
        )}

        {/* Добавляем вывод информации о текущем видео для отладки */}
        {isDevMode && (
          <div className="absolute top-0 left-0 z-50 bg-black bg-opacity-50 text-white text-xs p-1 pointer-events-none">
            Video: {src.split("/").pop()} | Poster:{" "}
            {thumbnailUrl || poster || "None"} | State:{" "}
            {playing ? "Playing" : "Paused"}
            {currentQualityInfo ? ` | Quality: ${currentQualityInfo}` : ""}
          </div>
        )}

        <video
          ref={videoRef}
          className="w-full h-full object-cover absolute inset-0"
          poster={thumbnailUrl || poster || undefined}
          autoPlay={autoPlay}
          muted={videoMuted}
          loop={loop}
          playsInline
        />

        {/* Оверлей для клика по всему видео для воспроизведения/паузы */}
        <div className="absolute inset-0 cursor-pointer" onClick={togglePlay} />

        {/* Индикатор загрузки - показываем только до начала воспроизведения */}
        {loading && !playing && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Сообщение об ошибке */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70 text-white p-4 text-center">
            <div className="max-w-md">
              <h3 className="text-xl font-bold mb-2">Ошибка воспроизведения</h3>
              <p className="text-sm opacity-80">{error}</p>
              <button
                className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors"
                onClick={() => window.location.reload()}
              >
                <RotateCcw className="w-4 h-4 inline mr-2" />
                Перезагрузить
              </button>
            </div>
          </div>
        )}

        {/* Элементы управления */}
        {controls && (
          <div
            className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-4 pt-10 pb-2 transition-opacity duration-300 ${showControls || !playing ? "opacity-100" : "opacity-0 pointer-events-none"}`}
            onClick={e => e.stopPropagation()}
          >
            {/* Прогресс-бар */}
            <div className="w-full mb-2 relative h-1 group">
              {/* Буфер */}
              <div
                className="absolute h-full bg-white/30 rounded-full"
                style={{ width: `${(buffered / duration) * 100}%` }}
              />

              {/* Слайдер прогресса */}
              <input
                type="range"
                min="0"
                max={duration || 0}
                step="any"
                value={currentTime}
                onChange={handleTimeChange}
                className="absolute w-full h-full opacity-0 cursor-pointer z-10"
              />

              {/* Индикатор прогресса */}
              <div
                className="absolute h-full bg-indigo-500 rounded-full"
                style={{ width: `${(currentTime / duration) * 100}%` }}
              />

              {/* Увеличенный прогресс-бар при наведении */}
              <div className="absolute -top-1 -left-1 -right-1 -bottom-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                <div
                  className="absolute h-3 bg-indigo-500 rounded-full top-1/2 transform -translate-y-1/2"
                  style={{ width: `${(currentTime / duration) * 100}%` }}
                >
                  <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-white rounded-full border-2 border-indigo-500" />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {/* Кнопка плей/пауза */}
                <button
                  onClick={togglePlay}
                  className="text-white hover:text-indigo-300 transition-colors"
                  aria-label={playing ? "Пауза" : "Воспроизвести"}
                >
                  {playing ? (
                    <Pause className="w-5 h-5" />
                  ) : (
                    <Play className="w-5 h-5" />
                  )}
                </button>

                {/* Кнопка звука */}
                <button
                  onClick={toggleMute}
                  className="text-white hover:text-indigo-300 transition-colors"
                  aria-label={videoMuted ? "Включить звук" : "Выключить звук"}
                >
                  {videoMuted ? (
                    <VolumeX className="w-5 h-5" />
                  ) : (
                    <Volume2 className="w-5 h-5" />
                  )}
                </button>

                {/* Времена */}
                <div className="text-white text-xs">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </div>
              </div>

              <div className="flex items-center space-x-3">
                {/* Селектор качества */}
                {qualityLevels.length > 0 && (
                  <div className="relative">
                    <button
                      onClick={() => setShowQualityMenu(!showQualityMenu)}
                      className="flex items-center space-x-1 text-white text-xs hover:text-indigo-300 transition-colors"
                      aria-label="Изменить качество"
                    >
                      <Settings className="w-4 h-4" />
                      <span>
                        {currentQuality === -1
                          ? "АВТО"
                          : qualityLevels.find(q => q.index === currentQuality)
                              ?.name || "АВТО"}
                      </span>
                      <ChevronDown className="w-3 h-3" />
                    </button>

                    {showQualityMenu && (
                      <div className="absolute bottom-full right-0 mb-1 bg-black/90 rounded-md p-2 min-w-[120px]">
                        <button
                          className={`block w-full text-left px-2 py-1 text-xs rounded ${currentQuality === -1 ? "bg-indigo-600 text-white" : "text-white hover:bg-indigo-600/50"}`}
                          onClick={() => selectQuality(-1)}
                        >
                          АВТО
                        </button>
                        {qualityLevels.map(level => (
                          <button
                            key={level.index}
                            className={`block w-full text-left px-2 py-1 text-xs rounded ${currentQuality === level.index ? "bg-indigo-600 text-white" : "text-white hover:bg-indigo-600/50"}`}
                            onClick={() => selectQuality(level.index)}
                          >
                            {level.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Кнопка полного экрана */}
                <button
                  onClick={toggleFullscreen}
                  className="text-white hover:text-indigo-300 transition-colors"
                  aria-label={
                    isFullscreen
                      ? "Выйти из полноэкранного режима"
                      : "Полноэкранный режим"
                  }
                >
                  <Maximize className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
);

// Добавляем displayName для форвард реф компонента
VideoPlayer.displayName = "VideoPlayer";
