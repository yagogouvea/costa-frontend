import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import * as TogglePrimitive from "@radix-ui/react-toggle";
import { Bold, Italic, Strikethrough, List } from 'lucide-react';
import { cn } from "@/lib/utils";

interface TiptapProps {
  content: string;
  onChange: (html: string) => void;
  editable?: boolean;
}

const toggleStyles = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-muted hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground h-8 px-2";

const Tiptap = ({ content, onChange, editable = true }: TiptapProps): JSX.Element | null => {
  const editor = useEditor({
    extensions: [StarterKit],
    content,
    editable,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
    },
  });

  if (!editor) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2">
      {editable && (
        <div className="flex gap-1 p-1 bg-gray-50 rounded-t border-b">
          <TogglePrimitive.Root
            pressed={editor.isActive('bold')}
            onPressedChange={() => editor.chain().focus().toggleBold().run()}
            className={cn(toggleStyles, "h-8 w-8 p-2")}
          >
            <Bold className="h-4 w-4" />
          </TogglePrimitive.Root>
          <TogglePrimitive.Root
            pressed={editor.isActive('italic')}
            onPressedChange={() => editor.chain().focus().toggleItalic().run()}
            className={cn(toggleStyles, "h-8 w-8 p-2")}
          >
            <Italic className="h-4 w-4" />
          </TogglePrimitive.Root>
          <TogglePrimitive.Root
            pressed={editor.isActive('strike')}
            onPressedChange={() => editor.chain().focus().toggleStrike().run()}
            className={cn(toggleStyles, "h-8 w-8 p-2")}
          >
            <Strikethrough className="h-4 w-4" />
          </TogglePrimitive.Root>
          <TogglePrimitive.Root
            pressed={editor.isActive('bulletList')}
            onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
            className={cn(toggleStyles, "h-8 w-8 p-2")}
          >
            <List className="h-4 w-4" />
          </TogglePrimitive.Root>
        </div>
      )}
      <EditorContent editor={editor} className="prose prose-sm max-w-none p-2" />
    </div>
  );
};

export default Tiptap; 