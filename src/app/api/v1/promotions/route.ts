import { NextResponse } from 'next/server';
import { productRepository } from '@/infrastructure/repositories/ProductRepository';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const stage = searchParams.get('stage') || undefined;
    const includeAll = searchParams.get('all') === 'true';

    const promotions = await productRepository.getPromotions(stage, includeAll);
    return NextResponse.json({ success: true, data: promotions });
  } catch (err: any) {
    console.error('Error en GET /api/v1/promotions:', err);
    return NextResponse.json({ success: false, error: 'Error al obtener promociones' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, subtitle, code, discountPercent, discountAmount, imageUrl, targetBabyStage, productId } = body;

    if (!title) {
      return NextResponse.json({ success: false, error: 'Se requiere título de la promoción o cupón' }, { status: 400 });
    }

    const promotion = await productRepository.createPromotion({
      title,
      subtitle,
      code: code ? code.trim().toUpperCase() : undefined,
      discountPercent: discountPercent ? parseFloat(discountPercent) : undefined,
      discountAmount: discountAmount ? parseFloat(discountAmount) : undefined,
      imageUrl,
      targetBabyStage,
      productId,
    });

    return NextResponse.json({ success: true, message: 'Cupón/Promoción creada con éxito', data: promotion });
  } catch (err: any) {
    console.error('Error en POST /api/v1/promotions:', err);
    return NextResponse.json({ success: false, error: err.message || 'Error al crear la promoción' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'ID de promoción requerido' }, { status: 400 });
    }
    await productRepository.deletePromotion(id);
    return NextResponse.json({ success: true, message: 'Promoción/Cupón eliminado' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Error al eliminar promoción' }, { status: 500 });
  }
}
