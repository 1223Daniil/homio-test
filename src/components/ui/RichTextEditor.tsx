import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import { Button } from '@heroui/react';
import { useEffect } from 'react';
import {
  IconBold,
  IconItalic,
  IconList,
  IconListNumbers,
  IconQuote,
  IconLink,
  IconPhoto,
  IconAlignLeft,
  IconAlignCenter,
  IconAlignRight,
  IconH1,
  IconH2,
  IconH3
} from '@tabler/icons-react';
import { useTranslations } from 'next-intl';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder,
  minHeight = '400px'
}: RichTextEditorProps) {
  const t = useTranslations("Management.content.blogPosts");

  const finalPlaceholder = placeholder ?? t("placeholder");

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link.configure({
        openOnClick: false,
      }),
      Placeholder.configure({
        placeholder: finalPlaceholder,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  if (!editor) {
    return null;
  }

  const addImage = () => {
    const url = window.prompt('URL изображения:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const setLink = () => {
    const url = window.prompt('URL ссылки:');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="bg-gray-50 p-2 border-b flex flex-wrap gap-1">
        <Button
          size="sm"
          variant="flat"
          isIconOnly
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? 'bg-gray-200' : ''}
        >
          <IconBold size={18} />
        </Button>
        <Button
          size="sm"
          variant="flat"
          isIconOnly
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'bg-gray-200' : ''}
        >
          <IconItalic size={18} />
        </Button>
        <div className="w-px h-6 bg-gray-300 mx-1" />
        <Button
          size="sm"
          variant="flat"
          isIconOnly
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={editor.isActive('heading', { level: 1 }) ? 'bg-gray-200' : ''}
        >
          <IconH1 size={18} />
        </Button>
        <Button
          size="sm"
          variant="flat"
          isIconOnly
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={editor.isActive('heading', { level: 2 }) ? 'bg-gray-200' : ''}
        >
          <IconH2 size={18} />
        </Button>
        <Button
          size="sm"
          variant="flat"
          isIconOnly
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={editor.isActive('heading', { level: 3 }) ? 'bg-gray-200' : ''}
        >
          <IconH3 size={18} />
        </Button>
        <div className="w-px h-6 bg-gray-300 mx-1" />
        <Button
          size="sm"
          variant="flat"
          isIconOnly
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive('bulletList') ? 'bg-gray-200' : ''}
        >
          <IconList size={18} />
        </Button>
        <Button
          size="sm"
          variant="flat"
          isIconOnly
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive('orderedList') ? 'bg-gray-200' : ''}
        >
          <IconListNumbers size={18} />
        </Button>
        <Button
          size="sm"
          variant="flat"
          isIconOnly
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={editor.isActive('blockquote') ? 'bg-gray-200' : ''}
        >
          <IconQuote size={18} />
        </Button>
        <div className="w-px h-6 bg-gray-300 mx-1" />
        <Button
          size="sm"
          variant="flat"
          isIconOnly
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={editor.isActive({ textAlign: 'left' }) ? 'bg-gray-200' : ''}
        >
          <IconAlignLeft size={18} />
        </Button>
        <Button
          size="sm"
          variant="flat"
          isIconOnly
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={editor.isActive({ textAlign: 'center' }) ? 'bg-gray-200' : ''}
        >
          <IconAlignCenter size={18} />
        </Button>
        <Button
          size="sm"
          variant="flat"
          isIconOnly
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={editor.isActive({ textAlign: 'right' }) ? 'bg-gray-200' : ''}
        >
          <IconAlignRight size={18} />
        </Button>
        <div className="w-px h-6 bg-gray-300 mx-1" />
        <Button
          size="sm"
          variant="flat"
          isIconOnly
          onClick={setLink}
          className={editor.isActive('link') ? 'bg-gray-200' : ''}
        >
          <IconLink size={18} />
        </Button>
        <Button
          size="sm"
          variant="flat"
          isIconOnly
          onClick={addImage}
        >
          <IconPhoto size={18} />
        </Button>
      </div>
      <EditorContent 
        editor={editor} 
        className="prose prose-sm max-w-none p-4 [&_.ProseMirror]:min-h-[400px] [&_.ProseMirror]:outline-none"
        style={{ 
          minHeight,
          '--tw-prose-headings': 'rgb(17 24 39)',
        } as React.CSSProperties}
      />
      <style jsx global>{`
        .ProseMirror {
          padding: 1rem;
        }
        .ProseMirror h1 {
          font-size: 2em;
          font-weight: bold;
          margin-bottom: 0.5em;
          color: rgb(17 24 39);
        }
        .ProseMirror h2 {
          font-size: 1.5em;
          font-weight: bold;
          margin-bottom: 0.5em;
          color: rgb(17 24 39);
        }
        .ProseMirror h3 {
          font-size: 1.25em;
          font-weight: bold;
          margin-bottom: 0.5em;
          color: rgb(17 24 39);
        }
        .ProseMirror p {
          margin-bottom: 0.5em;
        }
        .ProseMirror ul {
          list-style-type: disc;
          padding-left: 1.5em;
          margin-bottom: 0.5em;
        }
        .ProseMirror ol {
          list-style-type: decimal;
          padding-left: 1.5em;
          margin-bottom: 0.5em;
        }
        .ProseMirror blockquote {
          border-left: 3px solid #e5e7eb;
          padding-left: 1em;
          color: #4b5563;
          font-style: italic;
          margin: 1em 0;
        }
        .ProseMirror a {
          color: #2563eb;
          text-decoration: underline;
        }
        .ProseMirror img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
          margin: 1em 0;
        }
        .ProseMirror strong {
          font-weight: bold;
        }
        .ProseMirror em {
          font-style: italic;
        }
        .ProseMirror p.is-editor-empty:first-child::before {
          color: #6b7280;
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
        }
        .ProseMirror [data-text-align='center'] {
          text-align: center;
        }
        .ProseMirror [data-text-align='right'] {
          text-align: right;
        }
        .ProseMirror [data-text-align='left'] {
          text-align: left;
        }
      `}</style>
    </div>
  );
} 