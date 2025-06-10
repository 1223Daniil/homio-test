"use client";

import { useCallback, useEffect, useState } from "react";
import { Button, Card, Divider, Tabs, Tab, Textarea } from "@heroui/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { IconBold, IconItalic, IconLink, IconList, IconListNumbers, IconPhoto, IconH1, IconH2, IconH3, IconCode } from "@tabler/icons-react";
import { useTranslations } from "next-intl";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
  label?: string;
  error?: string;
}

export function MarkdownEditor({
  value,
  onChange,
  placeholder,
  minHeight = "300px",
  label,
  error
}: MarkdownEditorProps) {
  const [selected, setSelected] = useState<string>("edit");
  const [localValue, setLocalValue] = useState(value);
  const t = useTranslations("Management.content.blogPosts");

  // Use default placeholder from translations if none provided
  const placeholderText = placeholder || t("placeholder");

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      setLocalValue(newValue);
      onChange(newValue);
    },
    [onChange]
  );

  const insertMarkdown = useCallback(
    (prefix: string, suffix: string = "") => {
      const textarea = document.querySelector(
        "textarea"
      ) as HTMLTextAreaElement;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = localValue.substring(start, end);
      const beforeText = localValue.substring(0, start);
      const afterText = localValue.substring(end);

      const newValue =
        beforeText + prefix + selectedText + suffix + afterText;
      setLocalValue(newValue);
      onChange(newValue);

      // Устанавливаем фокус и выделение после вставки
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(
          start + prefix.length,
          start + prefix.length + selectedText.length
        );
      }, 0);
    },
    [localValue, onChange]
  );

  const insertHeading = useCallback(
    (level: number) => {
      const prefix = "#".repeat(level) + " ";
      insertMarkdown(prefix);
    },
    [insertMarkdown]
  );

  return (
    <div className="w-full">
      {label && (
        <div className="text-sm font-medium mb-2 text-foreground">
          {label}
        </div>
      )}
      <Card className="w-full">
        <div className="p-2 border-b flex flex-wrap gap-1">
          <Button
            isIconOnly
            size="sm"
            variant="light"
            onPress={() => insertMarkdown("**", "**")}
            aria-label="Bold"
          >
            <IconBold size={18} />
          </Button>
          <Button
            isIconOnly
            size="sm"
            variant="light"
            onPress={() => insertMarkdown("*", "*")}
            aria-label="Italic"
          >
            <IconItalic size={18} />
          </Button>
          <Button
            isIconOnly
            size="sm"
            variant="light"
            onPress={() => insertHeading(1)}
            aria-label="Heading 1"
          >
            <IconH1 size={18} />
          </Button>
          <Button
            isIconOnly
            size="sm"
            variant="light"
            onPress={() => insertHeading(2)}
            aria-label="Heading 2"
          >
            <IconH2 size={18} />
          </Button>
          <Button
            isIconOnly
            size="sm"
            variant="light"
            onPress={() => insertHeading(3)}
            aria-label="Heading 3"
          >
            <IconH3 size={18} />
          </Button>
          <Divider orientation="vertical" className="h-8 mx-1" />
          <Button
            isIconOnly
            size="sm"
            variant="light"
            onPress={() => insertMarkdown("[", "](https://)")}
            aria-label="Link"
          >
            <IconLink size={18} />
          </Button>
          <Button
            isIconOnly
            size="sm"
            variant="light"
            onPress={() => insertMarkdown("![alt text](", ")")}
            aria-label="Image"
          >
            <IconPhoto size={18} />
          </Button>
          <Divider orientation="vertical" className="h-8 mx-1" />
          <Button
            isIconOnly
            size="sm"
            variant="light"
            onPress={() => insertMarkdown("- ")}
            aria-label="Unordered List"
          >
            <IconList size={18} />
          </Button>
          <Button
            isIconOnly
            size="sm"
            variant="light"
            onPress={() => insertMarkdown("1. ")}
            aria-label="Ordered List"
          >
            <IconListNumbers size={18} />
          </Button>
          <Button
            isIconOnly
            size="sm"
            variant="light"
            onPress={() => insertMarkdown("```\n", "\n```")}
            aria-label="Code Block"
          >
            <IconCode size={18} />
          </Button>
        </div>

        <Tabs
          selectedKey={selected}
          onSelectionChange={(key) => setSelected(key as string)}
          aria-label="Markdown Editor Tabs"
          className="px-2 pt-2"
        >
          <Tab key="edit" title={t("editor")}>
            <Textarea
              value={localValue}
              onValueChange={(value) => {
                setLocalValue(value);
                onChange(value);
              }}
              placeholder={placeholderText}
              minRows={10}
              size="lg"
              variant="bordered"
              classNames={{
                input: `min-h-[${minHeight}] font-mono text-sm`,
                inputWrapper: "bg-content1"
              }}
              isInvalid={!!error}
              errorMessage={error}
            />
          </Tab>
          <Tab key="preview" title={t("preview")}>
            <Card className="p-4 min-h-[300px] bg-content1">
              <div className="prose dark:prose-invert max-w-none">
                {localValue ? (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {localValue}
                  </ReactMarkdown>
                ) : (
                  <p className="text-gray-500">Нет содержимого для предпросмотра</p>
                )}
              </div>
            </Card>
          </Tab>
        </Tabs>
      </Card>
    </div>
  );
} 