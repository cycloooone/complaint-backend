import minioClient from "../database/minio.js" 

export function uploadFile(req, res) {
  try {
    if (!req.files || (!req.files.image && !req.files.video)) {
      return res.status(400).json({
        status: false,
        message: 'No file uploaded or invalid file type.',
      });
    }

    const handleFile = (file, contentType) => {
      minioClient.putObject('apc18-bucket', file.name, file.data, file.size, { 'Content-Type': contentType }, (err) => {
        if (err) {
          console.error(`Error uploading ${contentType} file: ${err.message}`);
          return res.status(500).json({
            status: false,
            message: `Error uploading ${contentType} file.`,
          });
        }
        console.log(`Uploaded ${contentType} successfully.`);
      });
    };

    if (req.files.image) {
      handleFile(req.files.image, 'image/jpeg');
    }

    if (req.files.video) {
      handleFile(req.files.video, 'video/mp4');
    }

    // Note: The response is sent once after all files are handled successfully
    res.json({
      status: true,
      message: 'Files uploaded successfully.',
    });
  } catch (error) {
    console.error(`Error: ${error.message}`);
    res.status(500).json({
      status: false,
      message: 'Internal server error.',
    });
  }
}


export async function getFile(req, res) {
  try {
    const bucketName = req.params.bucketName;
    const fileName = req.params.fileName;
    const buckets = await minioClient.listBuckets();

    minioClient.getObject(bucketName, fileName, (err, stream) => {
      if (err) {
        console.error(`Error retrieving file: ${err.message}`);
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
  } catch (error) {
    console.error(`Error: ${error.message}`);
    res.status(500).json({
      status: false,
      message: 'Internal server error.',
    });
  }
}
