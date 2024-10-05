export const uploadController = (req: any, res: any) => {
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
