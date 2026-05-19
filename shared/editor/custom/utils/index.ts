//можно ещё сделать и под caches, но я думаю так лучше

import { RefObject } from "react";

const CacheImg = new Map();

async function setSrcImgCache(url: string, img: RefObject<HTMLImageElement>) {
  const urlCache = await getCacheUrl(url);

  const imgCurrent = img.current;

  if (imgCurrent && urlCache) {
    imgCurrent.src = urlCache;
  }
}

async function getCacheUrl(url: string) {
  const cachedUrl = CacheImg.get(url);

  if (cachedUrl) {
    return cachedUrl;
  }

  const response = await fetch(url);

  const blob = await response.blob();

  if (!blob || blob.size === 0) {
    return;
  }

  const newUrl = URL.createObjectURL(blob);

  CacheImg.set(url, newUrl);

  return newUrl;
}

export { setSrcImgCache, getCacheUrl };
