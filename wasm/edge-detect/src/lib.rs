use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn sobel_edge_rgba(width: usize, height: usize, pixels: &[u8]) -> Vec<u8> {
    let mut out = vec![0_u8; pixels.len()];
    let stride = width * 4;

    if width < 3 || height < 3 {
        return out;
    }

    for y in 1..(height - 1) {
        for x in 1..(width - 1) {
            let i = y * stride + x * 4;
            let gx = -pixels[i - stride - 4] as i32
                - 2 * pixels[i - 4] as i32
                - pixels[i + stride - 4] as i32
                + pixels[i - stride + 4] as i32
                + 2 * pixels[i + 4] as i32
                + pixels[i + stride + 4] as i32;

            let gy = -pixels[i - stride - 4] as i32
                - 2 * pixels[i - stride] as i32
                - pixels[i - stride + 4] as i32
                + pixels[i + stride - 4] as i32
                + 2 * pixels[i + stride] as i32
                + pixels[i + stride + 4] as i32;

            let magnitude = (((gx * gx + gy * gy) as f64).sqrt()).min(255.0) as u8;
            out[i] = magnitude;
            out[i + 1] = magnitude;
            out[i + 2] = magnitude;
            out[i + 3] = 255;
        }
    }

    out
}
