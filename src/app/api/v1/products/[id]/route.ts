import { NextResponse } from 'next/server';
import { productRepository } from '@/infrastructure/repositories/ProductRepository';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const product = await productRepository.getProductById(resolvedParams.id);
    if (!product) {
      return NextResponse.json({ success: false, error: 'Producto no encontrado' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: product });
  } catch (err: any) {
    console.error('Error en GET /api/v1/products/[id]:', err);
    return NextResponse.json({ success: false, error: 'Error al obtener detalles del producto' }, { status: 500 });
  }
}
