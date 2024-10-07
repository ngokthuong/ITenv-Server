import cloudinary from 'cloudinary';

export const uploadSingleImageController = (req: any, res: any) => {
  try {
    const file = req.file;
    console.log(file);
    if (!file) {
      return res.status(400).json({ message: 'No image uploaded!' });
    }
    res.status(200).json({
      success: true,
      data: {
        url: file.path,
        filename: file.filename,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong!', error });
  }
};

export const deleteImageController = async (req: any, res: any) => {
  try {
    console.log(req.body);
    const images = req.body.images;
    if (images.length > 0) {
      await Promise.all(
        images.map(async (filename: string) => {
          if (filename) {
            await cloudinary.v2.uploader.destroy(filename);
          }
        }),
      );
    }
    res.status(200).json({ success: true, message: 'Images deleted successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong!', success: false, error: error });
  }
};
