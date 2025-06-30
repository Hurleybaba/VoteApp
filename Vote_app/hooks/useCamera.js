import * as Camera from "expo-camera";
import { useCallback, useEffect, useRef, useState } from "react";
import * as FileSystem from "expo-file-system";

export const useCamera = () => {
  const [hasPermission, setHasPermission] = useState(null);
  const cameraRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        // CORRECTED LINE: Access the nested 'Camera' property
        const { status } = await Camera.Camera.requestCameraPermissionsAsync();
        console.log("Camera permission status:", status);
        setHasPermission(status === "granted");
      } catch (error) {
        console.error("Error requesting camera permissions:", error);
        setHasPermission(false);
      }
    })();
  }, []);

  const processImage = useCallback(async () => {
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.7, // Good balance between quality and size
        base64: false, // We'll use the file URI directly
      });

      const base64Data = await FileSystem.readAsStringAsync(photo.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // 3. Prepare payload
      const dataUrl = `data:image/jpeg;base64,${base64Data}`;

      return { dataUrl, photo };
    } catch (e) {
      console.log(e);
    }
  }, [cameraRef]);

  return {
    cameraRef,
    hasPermission,
    processImage,
  };
};
