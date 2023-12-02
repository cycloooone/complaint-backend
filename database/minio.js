import * as Minio from 'minio';
const minioClient = new Minio.Client({
    endPoint: 'localhost',
    port: 9000,
    useSSL: false, 
    accessKey: 'XJUmeJ8Q37P65NyLgFCC',
    secretKey: 'lfxEdEfpBT42vq0rRvL5bqHD2YRcCwiCQWCHT5jY'
  });
export default minioClient
