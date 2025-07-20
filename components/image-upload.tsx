"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, X } from "lucide-react"

interface ImageUploadProps {
  images: string[]
  onImagesChange: (images: string[]) => void
  maxImages?: number
}

export default function ImageUpload({ images, onImagesChange, maxImages = 5 }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    setUploading(true)

    try {
      const newImages: string[] = []

      for (const file of files) {
        // Convert file to base64 data URL for preview
        const reader = new FileReader()
        const dataUrl = await new Promise<string>((resolve) => {
          reader.onload = () => resolve(reader.result as string)
          reader.readAsDataURL(file)
        })

        newImages.push(dataUrl)
      }

      const updatedImages = [...images, ...newImages].slice(0, maxImages)
      onImagesChange(updatedImages)
    } catch (error) {
      console.error("Error uploading images:", error)
    } finally {
      setUploading(false)
    }
  }

  const removeImage = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index)
    onImagesChange(updatedImages)
  }

  const addImageField = () => {
    if (images.length < maxImages) {
      onImagesChange([...images, ""])
    }
  }

  const updateImageUrl = (index: number, url: string) => {
    const updatedImages = images.map((img, i) => (i === index ? url : img))
    onImagesChange(updatedImages)
  }

  return (
    <div className="space-y-4">
      <div>
        <Label>Upload Images</Label>
        <div className="mt-2">
          <Input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            disabled={uploading || images.length >= maxImages}
            className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          <p className="text-sm text-gray-500 mt-1">Upload up to {maxImages} images. Supports PNG, JPG, JPEG, WebP</p>
        </div>
      </div>

      {/* Image Previews */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              {image.startsWith("data:") || image.startsWith("http") ? (
                <div className="aspect-square relative overflow-hidden rounded-lg border">
                  <img
                    src={image || "/placeholder.svg"}
                    alt={`Product image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeImage(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Input
                    placeholder="Or paste image URL"
                    value={image}
                    onChange={(e) => updateImageUrl(index, e.target.value)}
                  />
                  <Button type="button" variant="outline" size="sm" onClick={() => removeImage(index)}>
                    <X className="h-4 w-4 mr-1" />
                    Remove
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add URL Field Button */}
      {images.length < maxImages && (
        <Button type="button" variant="outline" onClick={addImageField}>
          <Upload className="h-4 w-4 mr-2" />
          Add Image URL
        </Button>
      )}

      {uploading && <p className="text-sm text-blue-600">Uploading images...</p>}
    </div>
  )
}
