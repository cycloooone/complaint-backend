import * as Minio from 'minio';
const minioClient = new Minio.Client({
    endPoint: 'localhost',
    port: 9000,
    useSSL: false, 
    accessKey: 'minio2',
    secretKey: 'oJLBQ7SeLIWDtvlv9VAsUgEjJgZv3eZyGEKK8iHX'
  });
export default minioClient
