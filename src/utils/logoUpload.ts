import { supabase } from '@/services/supabaseClient';

// Função para converter URL para Blob
async function urlToBlob(url: string): Promise<Blob> {
  // Se já é um blob URL, não precisa fazer fetch
  if (url.startsWith('blob:')) {
    try {
      const res = await fetch(url);
      return await res.blob();
    } catch (error) {
      console.error('Erro ao converter blob URL:', error);
      throw new Error('Não foi possível acessar o arquivo da imagem');
    }
  }
  
  // Se é uma URL HTTP, fazer fetch
  if (url.startsWith('http')) {
    const res = await fetch(url);
    return await res.blob();
  }
  
  // Para URLs relativas, usar a API
  const res = await fetch(url);
  return await res.blob();
}

// Função para fazer upload de logo para o Supabase
export const uploadLogoToSupabase = async (file: File | string): Promise<string | null> => {
  try {
    let fileToSend: Blob;
    let contentType: string;

    if (typeof file === 'string') {
      // Se for uma string (URL), converter para blob
      fileToSend = await urlToBlob(file);
      contentType = 'image/jpeg'; // Default para URLs
    } else {
      // Se for um File, usar diretamente
      fileToSend = file;
      contentType = file.type;
    }

    // Gerar nome único para o arquivo
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2);
    const extension = contentType.includes('png') ? 'png' : 
                     contentType.includes('gif') ? 'gif' : 'jpg';
    const filename = `logos/${timestamp}-${randomId}.${extension}`;

    console.log('Tentando upload de logo para Supabase...');
    
    // Upload para o bucket 'segtracklogos' (ou 'segtrackfotos' se não existir)
    const { error: uploadError } = await supabase.storage
      .from('segtrackfotos') // Usar o mesmo bucket das fotos por enquanto
      .upload(filename, fileToSend, {
        contentType: contentType,
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      throw new Error(`Supabase upload failed: ${uploadError.message}`);
    }

    // Obter URL pública
    const { data: urlData } = supabase.storage
      .from('segtrackfotos')
      .getPublicUrl(filename);

    const publicUrl = urlData?.publicUrl;
    console.log('Upload de logo para Supabase bem-sucedido:', publicUrl);
    
    return publicUrl || null;

  } catch (error) {
    console.error('Erro ao fazer upload de logo para Supabase:', error);
    throw error;
  }
};

// Função para deletar logo do Supabase
export const deleteLogoFromSupabase = async (logoUrl: string): Promise<boolean> => {
  try {
    // Extrair o nome do arquivo da URL
    const urlParts = logoUrl.split('/');
    const filename = urlParts[urlParts.length - 1];
    
    if (!filename) {
      console.warn('Não foi possível extrair o nome do arquivo da URL:', logoUrl);
      return false;
    }

    const { error } = await supabase.storage
      .from('segtrackfotos')
      .remove([`logos/${filename}`]);

    if (error) {
      console.error('Erro ao deletar logo do Supabase:', error);
      return false;
    }

    console.log('Logo deletado do Supabase com sucesso');
    return true;

  } catch (error) {
    console.error('Erro ao deletar logo do Supabase:', error);
    return false;
  }
}; 