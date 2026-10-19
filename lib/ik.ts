// Thu nhỏ ảnh khi hiển thị (ImageKit resize on-the-fly) để trang tải nhanh
export const ik = (url: string, width: number) =>
  `${url}${url.includes("?") ? "&" : "?"}tr=w-${width},q-85`;
