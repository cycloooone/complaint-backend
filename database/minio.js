import * as Minio from 'minio';
const minioClient = new Minio.Client({
    endPoint: 'localhost',
    port: 9000,
    useSSL: false, // Set to true if using SSL/TLS
    accessKey: 'M23okQ0Ys9P6MOKq1xy8',
    secretKey: '7Wj17BLl023lLRW6VUuGu0QDU8LU25Y8RScQgM0z'
  });
export default minioClient
