import { useEffect, useMemo, useState } from "react";
import { Crop, Download, FlipHorizontal, FlipVertical, RotateCcw, RotateCw } from "lucide-react";
import type { UploadedImage } from "@/types";
import { getResizeOutputFormat } from "@/utils/imageConverter";
import { useI18n } from "@/i18n/I18nContext";

interface Props { uploadedImage: UploadedImage; onReset: () => void; }

export default function ImageEditor({ uploadedImage, onReset }: Props) {
  const { language } = useI18n();
  const ko = language === "ko";
  const [angle, setAngle] = useState(0);
  const [flipX, setFlipX] = useState(false);
  const [flipY, setFlipY] = useState(false);
  const [crop, setCrop] = useState(false);
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  const [width, setWidth] = useState(uploadedImage.width);
  const [height, setHeight] = useState(uploadedImage.height);
  const [result, setResult] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setAngle(0); setFlipX(false); setFlipY(false); setCrop(false);
    setX(0); setY(0); setWidth(uploadedImage.width); setHeight(uploadedImage.height);
    setResult(null); setResultBlob(null); setError("");
  }, [uploadedImage.file]);

  const outputFormat = getResizeOutputFormat(uploadedImage.file);
  const extension = outputFormat === "jpeg" ? "jpg" : outputFormat;
  const previewTransform = useMemo(() => {
    const sx = flipX ? -1 : 1, sy = flipY ? -1 : 1;
    return `rotate(${angle}deg) scaleX(${sx}) scaleY(${sy})`;
  }, [angle, flipX, flipY]);

  const resetEdit = () => {
    setAngle(0); setFlipX(false); setFlipY(false); setCrop(false);
    setX(0); setY(0); setWidth(uploadedImage.width); setHeight(uploadedImage.height);
    setResult(null); setResultBlob(null); setError("");
  };

  const apply = async () => {
    setError("");
    if (crop && (x < 0 || y < 0 || width < 1 || height < 1 || x + width > uploadedImage.width || y + height > uploadedImage.height)) {
      setError(ko ? "자르기 범위가 원본 이미지 안에 있어야 합니다." : "The crop area must stay inside the original image.");
      return;
    }
    try {
      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("LOAD"));
        img.src = uploadedImage.previewUrl;
      });
      const radians = angle * Math.PI / 180;
      const swap = Math.abs(angle % 180) === 90;
      const sourceW = crop ? width : img.naturalWidth;
      const sourceH = crop ? height : img.naturalHeight;
      const outW = swap ? sourceH : sourceW;
      const outH = swap ? sourceW : sourceH;
      const canvas = document.createElement("canvas");
      canvas.width = outW; canvas.height = outH;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("CTX");
      if (outputFormat === "jpeg") { ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, outW, outH); }
      ctx.translate(outW / 2, outH / 2);
      ctx.rotate(radians);
      ctx.scale(flipX ? -1 : 1, flipY ? -1 : 1);
      ctx.drawImage(img, crop ? x : 0, crop ? y : 0, sourceW, sourceH, -sourceW / 2, -sourceH / 2, sourceW, sourceH);
      const mime = `image/${outputFormat}`;
      const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(b => b ? resolve(b) : reject(new Error("BLOB")), mime, outputFormat === "png" ? undefined : 0.92));
      const url = URL.createObjectURL(blob);
      setResult(url); setResultBlob(blob);
    } catch {
      setError(ko ? "이미지를 편집하지 못했습니다. 다른 이미지를 사용해 주세요." : "Could not edit the image. Please try another image.");
    }
  };

  const download = () => {
    if (!resultBlob) return;
    const url = URL.createObjectURL(resultBlob);
    const a = document.createElement("a");
    a.href = url; a.download = `${uploadedImage.file.name.replace(/\.[^/.]+$/, "")}-edited.${extension}`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 500);
  };

  return <section className="rounded-2xl border border-white/60 bg-white/80 p-4 shadow-md backdrop-blur-sm sm:p-5">
    {!result ? <>
      <div className="mb-4 flex items-center gap-2"><Crop className="h-5 w-5 text-blue-600"/><h2 className="text-lg font-bold text-gray-800">{ko ? "이미지 편집" : "Edit Image"}</h2></div>
      <p className="mb-4 text-sm text-gray-600">{ko ? "회전, 좌우·상하 반전, 필요한 영역 자르기를 한 번에 적용합니다." : "Rotate, flip, and crop your image in the browser."}</p>
      <div className="mb-4 flex min-h-56 items-center justify-center overflow-hidden rounded-xl bg-gray-50 p-4">
        <img src={uploadedImage.previewUrl} alt="" className="max-h-72 max-w-full object-contain transition-transform" style={{transform: previewTransform}}/>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <button type="button" onClick={()=>setAngle(v=>(v+90)%360)} className="rounded-xl border bg-white px-3 py-2.5 text-sm font-semibold"><RotateCw className="mx-auto mb-1 h-4 w-4"/>{ko?"90° 회전":"Rotate 90°"}</button>
        <button type="button" onClick={()=>setAngle(v=>(v+270)%360)} className="rounded-xl border bg-white px-3 py-2.5 text-sm font-semibold"><RotateCcw className="mx-auto mb-1 h-4 w-4"/>{ko?"반대 회전":"Rotate Back"}</button>
        <button type="button" onClick={()=>setFlipX(v=>!v)} className={`rounded-xl border px-3 py-2.5 text-sm font-semibold ${flipX?"border-blue-400 bg-blue-50 text-blue-700":"bg-white"}`}><FlipHorizontal className="mx-auto mb-1 h-4 w-4"/>{ko?"좌우 반전":"Flip H"}</button>
        <button type="button" onClick={()=>setFlipY(v=>!v)} className={`rounded-xl border px-3 py-2.5 text-sm font-semibold ${flipY?"border-blue-400 bg-blue-50 text-blue-700":"bg-white"}`}><FlipVertical className="mx-auto mb-1 h-4 w-4"/>{ko?"상하 반전":"Flip V"}</button>
      </div>
      <button type="button" onClick={()=>setCrop(v=>!v)} className={`mt-3 w-full rounded-xl border px-3 py-2.5 text-sm font-semibold ${crop?"border-blue-400 bg-blue-50 text-blue-700":"bg-white text-gray-700"}`}>{crop ? (ko?"자르기 입력 닫기":"Hide crop settings") : (ko?"자르기 설정":"Crop settings")}</button>
      {crop && <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[
          { label: "X", value: x, setValue: setX, min: 0, max: uploadedImage.width },
          { label: "Y", value: y, setValue: setY, min: 0, max: uploadedImage.height },
          { label: ko ? "가로" : "Width", value: width, setValue: setWidth, min: 1, max: uploadedImage.width },
          { label: ko ? "세로" : "Height", value: height, setValue: setHeight, min: 1, max: uploadedImage.height }
        ].map(({ label, value, setValue, min, max }) => (
          <label key={label} className="text-xs font-semibold text-gray-600">
            {label}
            <input type="number" min={min} max={max} value={value} onChange={e => setValue(Number(e.target.value))} className="mt-1 w-full rounded-xl border px-3 py-2 text-sm" />
          </label>
        ))}
      </div>}
      {error && <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      <button type="button" onClick={apply} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 px-4 py-3 font-bold text-white"><Crop className="h-5 w-5"/>{ko?"편집 적용하기":"Apply Edits"}</button>
      <button type="button" onClick={onReset} className="mt-2 w-full rounded-xl border bg-white px-4 py-2.5 text-sm font-semibold text-gray-600">{ko?"다른 이미지 선택":"Choose another image"}</button>
    </> : <>
      <div className="mb-4 text-center"><h2 className="text-lg font-bold text-gray-800">{ko?"편집 완료":"Editing complete"}</h2></div>
      <div className="flex justify-center rounded-xl bg-gray-50 p-4"><img src={result} alt="" className="max-h-80 max-w-full object-contain"/></div>
      <button type="button" onClick={download} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 px-4 py-3 font-bold text-white"><Download className="h-5 w-5"/>{ko?"편집된 이미지 다운로드":"Download Edited Image"}</button>
      <button type="button" onClick={()=>setResult(null)} className="mt-2 w-full rounded-xl border bg-white px-4 py-2.5 text-sm font-semibold text-gray-600">{ko?"다시 편집":"Edit Again"}</button>
      <button type="button" onClick={onReset} className="mt-2 w-full text-sm text-gray-500 underline">{ko?"다른 이미지 선택":"Choose another image"}</button>
    </>}
  </section>;
}
