import { useStorageUrl } from '@/lib/storageUrl';

type Props = Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> & { src?: string | null };

/** <img> that automatically signs URLs from private storage buckets. */
const SecureImg = ({ src, ...rest }: Props) => {
  const resolved = useStorageUrl(src);
  if (!resolved) return null;
  return <img src={resolved} {...rest} />;
};

export default SecureImg;
