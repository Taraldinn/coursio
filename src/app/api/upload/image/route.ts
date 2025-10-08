import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

// POST /api/upload/image - Upload image to ImgBB
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const image = formData.get('image') as File;

    if (!image) {
      return NextResponse.json(
        { error: 'Image is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.IMGBB_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'ImgBB API key not configured' },
        { status: 500 }
      );
    }

    // Convert image to base64
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');

    // Upload to ImgBB
    const uploadFormData = new FormData();
    uploadFormData.append('image', base64);

    const response = await fetch(
      `https://api.imgbb.com/1/upload?key=${apiKey}`,
      {
        method: 'POST',
        body: uploadFormData
      }
    );

    if (!response.ok) {
      throw new Error('Failed to upload image');
    }

    const data = await response.json();

    return NextResponse.json({
      url: data.data.url,
      deleteUrl: data.data.delete_url,
      thumb: data.data.thumb.url,
      medium: data.data.medium?.url,
      display: data.data.display_url
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    );
  }
}
