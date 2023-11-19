import minioClient from "../database/minio.js" 
export function uploadFile(req, res){
    try {
        if (!req.files || (!req.files.image && !req.files.video)) {
          return res.status(400).json({
            status: false,
            message: 'No file uploaded or invalid file type.',
          });
        }
    
        // Handle image file
        if (req.files.image) {
          const image = req.files.image;
          const imageMetaData = {
            'Content-Type': 'image/jpeg', // Adjust the content type as needed
          };
    
          minioClient.putObject('apc18-bucket', image.name, image.data, image.size, imageMetaData, function (err) {
            if (err) {
              console.error(err);
              return res.status(500).json({
                status: false,
                message: 'Error uploading image file.',
              });
            }
            console.log('Uploaded image successfully.');
          });
        }
    
        // Handle video file
        if (req.files.video) {
          const video = req.files.video;
          const videoMetaData = {
            'Content-Type': 'video/mp4', // Adjust the content type as needed
          };
    
          minioClient.putObject('apc18-bucket', video.name, video.data, video.size, videoMetaData, function (err) {
            if (err) {
              console.error(err);
              return res.status(500).json({
                status: false,
                message: 'Error uploading video file.',
              });
            }
            console.log('Uploaded video successfully.');
          });
        }
    
        res.json({
          status: true,
          message: 'Files uploaded successfully.',
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({
          status: false,
          message: 'Internal server error.',
        });
      }
    }
export function getFile(req, res){
    const bucketName = req.params.bucketName;
    const fileName = req.params.fileName;
  
    minioClient.getObject(bucketName, fileName, (err, stream) => {
      if (err) {
        return res.status(500).send('Internal server error');
      }
  
      let contentType = 'application/octet-stream';
  
      if (fileName.endsWith('.jpg') || fileName.endsWith('.jpeg')) {
        contentType = 'image/jpeg';
      } else if (fileName.endsWith('.png')) {
        contentType = 'image/png';
      } else if (fileName.endsWith('.pdf')) {
        contentType = 'application/pdf';
      } else if (fileName.endsWith('.mp4')) {
        contentType = 'video/mp4';
      }
  
      res.setHeader('Content-Type', contentType);
      stream.pipe(res);
    });
}
