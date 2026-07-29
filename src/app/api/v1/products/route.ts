import { NextResponse } from 'next/server';
import { productRepository } from '@/infrastructure/repositories/ProductRepository';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') || undefined;
    const query = searchParams.get('q') || undefined;

    const products = await productRepository.getProducts(category, query);
    return NextResponse.json({ success: true, data: products });
  } catch (err: any) {
    console.error('Error en GET /api/v1/products:', err);
    return NextResponse.json({ success: false, error: 'Error al consultar productos' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { id, image, additionalImages } = await req.json();

    if (!id || !image) {
      return NextResponse.json({ success: false, error: 'Se requiere id de producto y la nueva URL de la imagen' }, { status: 400 });
    }

    const updated = await productRepository.updateProductImage(id, image, additionalImages);
    return NextResponse.json({ success: true, message: 'URL de imagen actualizada con éxito', data: updated });
  } catch (err: any) {
    console.error('Error en PUT /api/v1/products:', err);
    return NextResponse.json({ success: false, error: 'Error al actualizar imagen de producto' }, { status: 500 });
  }
}
