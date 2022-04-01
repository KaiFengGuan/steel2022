import request from '@/utils/request';
import { baseURL } from '@/utils/request';

export const ALGORITHM_OPTION = {
  T_SNE: 'T-SNE',
  UMAP: 'UMAP',
  ISOMAP: 'ISOMAP',
  PCA: 'PCA',
  T_SNE_Cate: 'T-SNE-cate',
  UMAP_Cate: 'UMAP-cate',
  ISOMAP_Cate: 'ISOMAP-cate',
  PCA_Cate: 'PCA-cate',
}

const ALGORITHM_SELECT = {};
ALGORITHM_SELECT[ALGORITHM_OPTION.T_SNE] = 'VisualizationTsne';
ALGORITHM_SELECT[ALGORITHM_OPTION.UMAP] = 'VisualizationUMAP';
ALGORITHM_SELECT[ALGORITHM_OPTION.ISOMAP] = 'VisualizationISOMAP';
ALGORITHM_SELECT[ALGORITHM_OPTION.PCA] = 'VisualizationPCA';
ALGORITHM_SELECT[ALGORITHM_OPTION.T_SNE_Cate] = 'CateVisualizationTsne';
ALGORITHM_SELECT[ALGORITHM_OPTION.UMAP_Cate] = 'CateVisualizationUMAP';
ALGORITHM_SELECT[ALGORITHM_OPTION.ISOMAP_Cate] = 'CateVisualizationISOMAP';
ALGORITHM_SELECT[ALGORITHM_OPTION.PCA_Cate] = 'CateVisualizationPCA';

export function scattorData (algOpt, dateStart, dateEnd, data) {
  let algorithm = ALGORITHM_SELECT[algOpt];

  return request({
    url: baseURL + `/v1.0/model/${algorithm}/${dateStart}/${dateEnd}/`,
    method: 'post',
    data
  })
}