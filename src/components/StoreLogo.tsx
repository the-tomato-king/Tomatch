import React, { useEffect, useState } from "react";
import { Image, ImageStyle } from "react-native";
import { getStoreLogo } from "../services/firebase/storageHelper";

interface StoreLogoProps {
  width: number;
  height: number;
  brand: string;
  style?: ImageStyle;
}

const StoreLogo: React.FC<StoreLogoProps> = ({
  width,
  height,
  brand,
  style,
}) => {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    const loadLogo = async () => {
      try {
        const url = await getStoreLogo(brand);
        setLogoUrl(url);
      } catch (error) {
        console.error("Failed to load store logo:", error);
      }
    };

    loadLogo();
  }, [brand]);

  if (!logoUrl) {
    return null;
  }

  return (
    <Image
      source={{ uri: logoUrl }}
      style={[{ width, height }, style]}
      resizeMode="contain"
    />
  );
};

export default StoreLogo;
