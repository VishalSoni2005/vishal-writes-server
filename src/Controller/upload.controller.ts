import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import { Response, Request } from "express";

// interface UploadedFile {
//   name: string;
//   tempFilePath: string;
//   [key: string]: any;
// }

// interface FileUploadRequest {
//   files?: {
//     file?: UploadedFile;
//   };
// }
import fileUpload from "express-fileupload";

interface UploadedFile {
  name: string;
  tempFilePath: string;
  [key: string]: any;
}

export interface FileUploadRequest {
  files?: {
    file?: UploadedFile;
  };
}

function isValidFileType(fileName: string, supportedTypes: string[]): boolean {
  const fileExtension = fileName.split(".").pop()?.toLowerCase() || "";
  return supportedTypes.includes(fileExtension);
}

// Utility function to upload files to Cloudinary
async function uploadToCloudinary(
  file: UploadedFile,
  folder: string,
  quality?: number
): Promise<UploadApiResponse> {
  const options: any = { folder };
  options.resource_type = "auto";
  if (quality) {
    options.quality = quality;
  }
  return await cloudinary.uploader.upload(file.tempFilePath, options);
}
export const uploadBanner = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.files || !req.files.file) {
      res.status(400).json({ message: "No file uploaded." });
      return;
    }

    const file = req.files.file as UploadedFile;

    const supportedTypes = ["jpg", "png", "svg", "gif", "jpeg"];
    const fileType = file.name.split(".").pop()?.toLowerCase() || "";

    if (!supportedTypes.includes(fileType)) {
      res.status(400).json({
        success: false,
        msg: "Invalid file type"
      });
      return;
    }

    const response = await uploadToCloudinary(file, "VishalSoni");

    res.status(200).json({
      msg: "File uploaded successfully",
      url: response.url,
      success: true
    });
  } catch (error) {
    res.status(500).json({
      msg: "Error uploading file",
      success: false
    });
  }
};

// export const uploadBanner = async (req: FileUploadRequest, res: Response): Promise<any> => {
//   try {
//     // Check if file is uploaded
//     if (!req.files || !req.files.file) {
//       return res.status(400).json({ message: "No file uploaded." });
//     }

//     const file = req.files.file;

//     // Validate file type
//     const supportedTypes = ["jpg", "png", "svg", "gif", "jpeg"];
//     const reqFileType = file.name.split(".").pop()?.toLowerCase() || "";

//     if (!isValidFileType(reqFileType, supportedTypes)) {
//       return res.status(400).json({
//         success: false,
//         msg: "Invalid file type. Supported types: jpg, png, svg, gif, jpeg",
//       });
//     }

//     // Upload file to Cloudinary
//     const response = await uploadToCloudinary(file, "VishalSoni");

//     // Return success response
//     res.status(200).json({
//       msg: "File uploaded successfully",
//       url: response.url,
//       success: true,
//     });
//   } catch (error: any) {
//     console.error("sorry Error uploading file:", error);
//     res.status(500).json({
//       msg: "Error uploading file",
//       success: false,
//     });
//   }
// };

// Utility function to upload files to Cloudinary
// async function uploadToCloudinary(file, folder, quality) {
//   const options = { folder };
//   options.resource_type = "auto"; //todo: important to detect file type
//   if (quality) {
//     options.quality = quality; //todo: important to compress file size
//   }
//   return await cloudinary.uploader.upload(file.tempFilePath, options);
// }

// export const uploadBanner = async (req, res) => {
//   try {
//     // Check if file is uploaded
//     if (!req.files || !req.files.file) {
//       return res.status(400).json({ message: "No file uploaded." });
//     }

//     const file = req.files.file;

//     // Validate file type
//     const supportedTypes = ["jpg", "png", "svg", "gif", "jpeg"];
//     const reqFileType = file.name.split(".").pop().toLowerCase(); // Get file extension
//     if (!isValidFileType(reqFileType, supportedTypes)) {
//       return res.status(400).json({
//         success: false,
//         msg: "Invalid file type. Supported types: jpg, png, svg, gif, jpeg",
//       });
//     }

//     // Upload file to Cloudinary
//     const response = await uploadToCloudinary(file, "VishalSoni");

//     // Return success response
//     // console.log("image URL ==>> ", response);
//     // console.log(response.url);

//     res.status(200).json({
//       msg: "File uploaded successfully",
//       url: response.url,
//       success: true,
//     });
//   } catch (error) {
//     console.error("sorry Error uploading file:", error);
//     res.status(500).json({
//       msg: "Error uploading file",
//       success: false,
//     });
//   }
// };
