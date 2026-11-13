import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../api/axiosClient';
export const useUploadComprobante = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('archivo', file);
      const res = await apiClient.post('/operaciones-manuales/gasto/comprobante', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gastos'] });
    },
  });
};
