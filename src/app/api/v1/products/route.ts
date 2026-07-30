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

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.name || body.price === undefined || !body.image) {
      return NextResponse.json(
        { success: false, error: 'Campos requeridos: nombre, precio e imagen principal.' },
        { status: 400 }
      );
    }

    const created = await productRepository.createProduct(body);
    return NextResponse.json({ success: true, message: 'Producto creado exitosamente', data: created });
  } catch (err: any) {
    console.error('Error en POST /api/v1/products:', err);
    return NextResponse.json({ success: false, error: 'Error al crear producto' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Se requiere id de producto' }, { status: 400 });
    }

    const updated = await productRepository.updateProduct(id, data);
    return NextResponse.json({ success: true, message: 'Producto actualizado con éxito', data: updated });
  } catch (err: any) {
    console.error('Error en PUT /api/v1/products:', err);
    return NextResponse.json({ success: false, error: 'Error al actualizar producto' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Se requiere id de producto' }, { status: 400 });
    }

    await productRepository.deleteProduct(id);
    return NextResponse.json({ success: true, message: 'Producto eliminado con éxito' });
  } catch (err: any) {
    console.error('Error en DELETE /api/v1/products:', err);
    return NextResponse.json({ success: false, error: 'Error al eliminar producto' }, { status: 500 });
  }
}
