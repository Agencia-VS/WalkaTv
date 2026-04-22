#!/usr/bin/env python3

import argparse
import os
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

from faster_whisper import WhisperModel
import yt_dlp


def format_timestamp(seconds: float) -> str:
    total = max(0, int(seconds))
    hours = total // 3600
    minutes = (total % 3600) // 60
    secs = total % 60
    if hours > 0:
        return f"{hours}:{minutes:02d}:{secs:02d}"
    return f"{minutes}:{secs:02d}"


def download_audio(video_id: str, work_dir: Path) -> Path:
    url = f"https://www.youtube.com/watch?v={video_id}"
    output_template = str(work_dir / "%(id)s.%(ext)s")

    opts = {
        "format": "bestaudio/best",
        "outtmpl": output_template,
        "quiet": True,
        "no_warnings": True,
        "noplaylist": True,
        "postprocessors": [
            {
                "key": "FFmpegExtractAudio",
                "preferredcodec": "mp3",
                "preferredquality": "192",
            }
        ],
    }

    with yt_dlp.YoutubeDL(opts) as ydl:
        info = ydl.extract_info(url, download=True)
        candidate = work_dir / f"{info['id']}.mp3"

    if candidate.exists():
        return candidate

    for ext in (".m4a", ".webm", ".mp3", ".opus"):
        alt = work_dir / f"{video_id}{ext}"
        if alt.exists():
            return alt

    raise RuntimeError("No se pudo descargar audio del video")


def trim_and_prepare_audio(input_audio: Path, output_audio: Path, max_minutes: int) -> None:
    max_seconds = str(max_minutes * 60)
    cmd = [
        "ffmpeg",
        "-y",
        "-i",
        str(input_audio),
        "-t",
        max_seconds,
        "-ac",
        "1",
        "-ar",
        "16000",
        str(output_audio),
    ]

    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        raise RuntimeError(f"ffmpeg fallo: {result.stderr.strip()}")


def transcribe(audio_path: Path, model_name: str, language: str) -> list[str]:
    model = WhisperModel(model_name, device="cpu", compute_type="int8")
    segments, _ = model.transcribe(
        str(audio_path),
        language=language,
        vad_filter=True,
        beam_size=5,
    )

    lines: list[str] = []
    for segment in segments:
        text = " ".join(segment.text.split())
        if not text:
            continue
        timestamp = format_timestamp(segment.start)
        lines.append(f"[{timestamp}] {text}")

    return lines


def main() -> None:
    parser = argparse.ArgumentParser(description="Transcribe un video de YouTube con Whisper")
    parser.add_argument("--video-id", required=True)
    parser.add_argument("--output", required=True)
    parser.add_argument("--model", default=os.getenv("WHISPER_MODEL", "small"))
    parser.add_argument("--language", default=os.getenv("WHISPER_LANGUAGE", "es"))
    parser.add_argument(
        "--max-audio-minutes",
        type=int,
        default=int(os.getenv("WHISPER_MAX_AUDIO_MINUTES", "75")),
    )

    args = parser.parse_args()

    temp_dir = Path(tempfile.mkdtemp(prefix="walka-whisper-"))
    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    try:
        raw_audio = download_audio(args.video_id, temp_dir)
        prepared_audio = temp_dir / "input.wav"
        trim_and_prepare_audio(raw_audio, prepared_audio, max(1, args.max_audio_minutes))

        lines = transcribe(prepared_audio, args.model, args.language)
        if not lines:
            raise RuntimeError("Whisper devolvio una transcripcion vacia")

        output_path.write_text("\n".join(lines) + "\n", encoding="utf-8")
        print(f"OK {output_path}")
    finally:
        shutil.rmtree(temp_dir, ignore_errors=True)


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:  # noqa: BLE001
        print(str(exc), file=sys.stderr)
        sys.exit(1)
