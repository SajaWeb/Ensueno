import crypto from 'crypto';

/**
 * Credenciales de Cloudinary, solo para el servidor.
 *
 * No se instala el SDK: lo único que hace falta del lado servidor es firmar
 * una carga, y eso son cuatro líneas de sha1. El archivo se sube del navegador
 * directo a Cloudinary, así que el secreto nunca sale de aquí y los archivos
 * no pasan por la función serverless (que tiene tope de tamaño de cuerpo).
 */
export interface CloudinaryConfig {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
}

/** `cloudinary://<key>:<secret>@<cloud>` — el formato que da el panel. */
function parseCloudinaryUrl(url: string): CloudinaryConfig | null {
  const m = url.match(/^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/);
  if (!m) return null;
  return { apiKey: m[1], apiSecret: m[2], cloudName: m[3].replace(/\/.*$/, '') };
}

/**
 * Las tres variables sueltas mandan; si faltan, se deducen de CLOUDINARY_URL.
 * Devuelve null cuando no hay nada configurado, para que el panel pueda avisar
 * en vez de reventar.
 */
export function getCloudinaryConfig(): CloudinaryConfig | null {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();

  if (cloudName && apiKey && apiSecret) {
    return { cloudName, apiKey, apiSecret };
  }

  const fromUrl = process.env.CLOUDINARY_URL?.trim();
  if (fromUrl) return parseCloudinaryUrl(fromUrl);

  return null;
}

/**
 * Firma para una carga directa.
 *
 * Cloudinary firma los parámetros ordenados alfabéticamente y unidos por `&`,
 * con el secreto pegado al final. No entran ni el archivo, ni `api_key`, ni
 * `cloud_name`, ni `resource_type`.
 */
export function signUploadParams(params: Record<string, string | number>, apiSecret: string) {
  const aFirmar = Object.keys(params)
    .filter((k) => params[k] !== '' && params[k] !== undefined)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join('&');

  return crypto.createHash('sha1').update(`${aFirmar}${apiSecret}`).digest('hex');
}
