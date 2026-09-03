import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Upload, X } from "lucide-react";

interface PortfolioUploadProps {
  providerId: string;
  onSuccess?: () => void;
}

export const PortfolioUpload = ({ providerId, onSuccess }: PortfolioUploadProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [projectUrl, setProjectUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file: File) => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${providerId}/${fileName}`;

    const { error: uploadError, data } = await supabase.storage
      .from("user-avatars")
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from("user-avatars")
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!imageFile) {
      toast.error("Please select an image");
      return;
    }

    setUploading(true);

    try {
      const imageUrl = await uploadImage(imageFile);

      const { error } = await supabase.from("portfolios").insert({
        provider_id: providerId,
        title,
        description,
        image_url: imageUrl,
        project_url: projectUrl || null,
      });

      if (error) throw error;

      toast.success("Portfolio item added successfully");
      setTitle("");
      setDescription("");
      setProjectUrl("");
      setImageFile(null);
      setImagePreview(null);
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Project Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="projectUrl">Project URL (optional)</Label>
        <Input
          id="projectUrl"
          type="url"
          value={projectUrl}
          onChange={(e) => setProjectUrl(e.target.value)}
        />
      </div>

      <div>
        <Label>Project Image</Label>
        <div className="mt-2">
          {imagePreview ? (
            <div className="relative">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-48 object-cover rounded-lg"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2"
                onClick={() => {
                  setImageFile(null);
                  setImagePreview(null);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50">
              <Upload className="h-8 w-8 mb-2 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Click to upload image</span>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleImageSelect}
              />
            </label>
          )}
        </div>
      </div>

      <Button type="submit" disabled={uploading} className="w-full">
        {uploading ? "Uploading..." : "Add Portfolio Item"}
      </Button>
    </form>
  );
};
