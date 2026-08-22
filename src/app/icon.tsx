import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#07080c",
          borderRadius: 10,
        }}
      >
        <div
          style={{
            width: 18,
            height: 18,
            borderRadius: 999,
            border: "1.5px solid #c9a96a",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: 999,
              background: "#c9a96a",
            }}
          />
        </div>
      </div>
    ),
    size,
  );
}
