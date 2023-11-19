import * as Minio from 'minio';
const minioClient = new Minio.Client({
    endPoint: 'localhost',
    port: 9000,
    useSSL: false, // Set to true if using SSL/TLS
    accessKey: 'BFGtjJXTTxVyfDHBVPFr',
    secretKey: 'Jv8prNIoAXb4PdKRd0FfOLqHWAjtsgcTfV4gRTpr'
  });
export default minioClient
