import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { auth } from '@/app/(auth)/auth';
import ILovePDFApi from '@ilovepdf/ilovepdf-nodejs';

// Use Blob instead of File since File is not available in Node.js environment
const FileSchema = z.object({
  file: z
    .instanceof(Blob)
    .refine((file) => file.size <= 150 * 1024 * 1024, {
      message: 'File size should be less than 150MB',
    })
    // Update the file type based on the kind of files you want to accept
    .refine(
      (file) =>
        [
          'image/jpeg',
          'image/png',
          'video/mp4',
          'audio/mpeg',
          'audio/mp4',
          'image/gif',
          'image/tiff',
          'image/bmp',
          'image/webp',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/pdf',
        ].includes(file.type),
      {
        message:
          'File type should be DOC, DOCX, PDF, JPEG, TIFF, PNG, GIF, BMP, WEBP, MP3 or MP4',
      },
    ),
});

const ILovePdfInstance = new ILovePDFApi(
  process.env.ILOVEPDF_PUBLIC_KEY as string,
  process.env.ILOVEPDF_SECRET_KEY as string,
);

async function ConverttoPDF(fileUrl: string) {
  const task = ILovePdfInstance.newTask('officepdf');
  await task.start();
  await task.addFile(fileUrl);
  await task.process();
  const fileData = await task.download();
  return fileData;
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (request.body === null) {
    return new Response('Request body is empty', { status: 400 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as Blob;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const validatedFile = FileSchema.safeParse({ file });

    if (!validatedFile.success) {
      const errorMessage = validatedFile.error.errors
        .map((error) => error.message)
        .join(', ');

      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    // Get filename from formData since Blob doesn't have name property
    const filename = (formData.get('file') as File).name;
    const fileBuffer = await file.arrayBuffer();

    try {
      const data = await put(`${filename}`, fileBuffer, {
        access: 'public',
      });

      if (
        file.type ===
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        file.type === 'application/msword'
      ) {
        try {
          // Convert WORD to PDF
          const pdfBuffer = await ConverttoPDF(data.url);
          const pdfFileName = `${filename.substring(0, filename.lastIndexOf('.')) || filename}.pdf`;
          try {
            const data = await put(
              `${pdfFileName}`,
              pdfBuffer.buffer as ArrayBuffer,
              {
                access: 'public',
              },
            );

            return NextResponse.json(data);
          } catch (error) {
            return NextResponse.json(
              { error: 'Upload failed after conversion to PDF' },
              { status: 500 },
            );
          }
        } catch (error) {
          return NextResponse.json(
            { error: 'Convert from Word to PDF failed' },
            { status: 500 },
          );
        }
      }
      return NextResponse.json(data);
    } catch (error) {
      return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 },
    );
  }
}
