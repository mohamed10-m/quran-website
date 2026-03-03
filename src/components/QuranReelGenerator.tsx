import React, { useState, useEffect, useRef } from 'react';
import { Play, Download, Loader2, Video, Settings, Music, Type, AlertCircle, Image as ImageIcon, Upload, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Surah {
  number: number;
  name: string;
  englishName: string;
  numberOfAyahs: number;
}

interface Ayah {
  number: number;
  text: string;
  numberInSurah: number;
  juz: number;
  manzil: number;
  page: number;
  ruku: number;
  hizbQuarter: number;
  sajda: boolean | object;
}

interface PexelsVideo {
  id: number;
  image: string;
  video_files: {
    id: number;
    quality: string;
    file_type: string;
    link: string;
  }[];
}

const RECITERS = [
  { id: 'Abdul_Basit_Murattal_192kbps', name: 'عبد الباسط عبد الصمد (مرتل)' },
  { id: 'Abdul_Basit_Mujawwad_128kbps', name: 'عبد الباسط عبد الصمد (مجود)' },
  { id: 'Abdullah_Basfar_192kbps', name: 'عبد الله بصفر' },
  { id: 'Abdurrahmaan_As-Sudais_192kbps', name: 'عبد الرحمن السديس' },
  { id: 'Abu_Bakr_Ash-Shaatree_128kbps', name: 'أبو بكر الشاطري' },
  { id: 'Ahmed_ibn_Ali_al-Ajamy_128kbps', name: 'أحمد بن علي العجمي' },
  { id: 'Alafasy_128kbps', name: 'مشاري راشد العفاسي' },
  { id: 'Ghamadi_40kbps', name: 'سعد الغامدي' },
  { id: 'Hani_Rifai_192kbps', name: 'هاني الرفاعي' },
  { id: 'Husary_128kbps', name: 'محمود خليل الحصري (مرتل)' },
  { id: 'Husary_Mujawwad_128kbps', name: 'محمود خليل الحصري (مجود)' },
  { id: 'Hudhaify_128kbps', name: 'علي بن عبد الرحمن الحذيفي' },
  { id: 'Ibrahim_Akhdar_32kbps', name: 'إبراهيم الأخضر' },
  { id: 'MaherAlMuaiqly128kbps', name: 'ماهر المعيقلي' },
  { id: 'Menshawi_16kbps', name: 'محمد صديق المنشاوي (مرتل)' },
  { id: 'Minshawy_Mujawwad_192kbps', name: 'محمد صديق المنشاوي (مجود)' },
  { id: 'Mohammad_al_Tablaway_128kbps', name: 'محمد محمود الطبلاوي' },
  { id: 'Muhammad_Ayyoub_128kbps', name: 'محمد أيوب' },
  { id: 'Muhammad_Jibreel_128kbps', name: 'محمد جبريل' },
  { id: 'Saood_ash-Shuraym_128kbps', name: 'سعود الشريم' },
  { id: 'Yaser_Salamah_128kbps', name: 'ياسر سلامة' },
  { id: 'Yasser_Ad-Dussary_128kbps', name: 'ياسر الدوسري' },
  { id: 'Nasser_Alqatami_128kbps', name: 'ناصر القطامي' },
  { id: 'Fares_Abbad_64kbps', name: 'فارس عباد' },
  { id: 'Ali_Jaber_64kbps', name: 'علي جابر' },
  { id: 'Khaalid_Abdullaah_al-Qahtaanee_192kbps', name: 'خالد القحطاني' }
];

export default function QuranReelGenerator() {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [selectedSurah, setSelectedSurah] = useState<number>(1);
  const [startAyah, setStartAyah] = useState<number>(1);
  const [endAyah, setEndAyah] = useState<number>(7);
  const [selectedReciter, setSelectedReciter] = useState<string>(RECITERS[0].id);
  
  const [videoFormat, setVideoFormat] = useState<'portrait' | 'landscape' | 'square'>('portrait');
  const [videoQuality, setVideoQuality] = useState<'720p' | '1080p' | '1440p'>('1080p');
  const [transitionType, setTransitionType] = useState<'crossfade' | 'fade' | 'none'>('crossfade');
  const [showSurahName, setShowSurahName] = useState(true);
  const [showAyahNumber, setShowAyahNumber] = useState(true);
  const [showReciterName, setShowReciterName] = useState(true);

  const [backgroundQuery, setBackgroundQuery] = useState<string>('nature');
  const [videos, setVideos] = useState<PexelsVideo[]>([]);
  const [selectedVideos, setSelectedVideos] = useState<string[]>([]);
  const [isSearchingVideos, setIsSearchingVideos] = useState(false);
  const [videoError, setVideoError] = useState<string>('');
  
  const [backgroundType, setBackgroundType] = useState<'video' | 'black' | 'image'>('video');
  const [customImage, setCustomImage] = useState<string | null>(null);

  const [estimatedDuration, setEstimatedDuration] = useState(0);
  const [isCalculatingDuration, setIsCalculatingDuration] = useState(false);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [videoExtension, setVideoExtension] = useState<string>('webm');

  const [previewAyahs, setPreviewAyahs] = useState<{text: string, numberInSurah: number}[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    fetch('https://api.alquran.cloud/v1/surah')
      .then(res => res.json())
      .then(data => {
        if (data.code === 200) {
          setSurahs(data.data);
        }
      })
      .catch(err => console.error('Failed to fetch surahs:', err));
  }, []);

  useEffect(() => {
    const surah = surahs.find(s => s.number === selectedSurah);
    if (surah) {
      setStartAyah(1);
      setEndAyah(Math.min(5, surah.numberOfAyahs));
    }
  }, [selectedSurah, surahs]);

  useEffect(() => {
    let isMounted = true;
    const fetchPreview = async () => {
      if (startAyah > endAyah || !selectedSurah) return;
      
      const surah = surahs.find(s => s.number === selectedSurah);
      if (!surah) return;

      setIsPreviewLoading(true);
      try {
        const isWholeSurah = startAyah === 1 && endAyah === surah.numberOfAyahs;
        
        if (isWholeSurah) {
          const [firstRes, lastRes] = await Promise.all([
            fetch(`https://api.alquran.cloud/v1/ayah/${selectedSurah}:1/quran-uthmani`),
            fetch(`https://api.alquran.cloud/v1/ayah/${selectedSurah}:${surah.numberOfAyahs}/quran-uthmani`)
          ]);
          const firstData = await firstRes.json();
          const lastData = await lastRes.json();
          
          if (isMounted && firstData.code === 200 && lastData.code === 200) {
            setPreviewAyahs([
              { text: firstData.data.text, numberInSurah: 1 },
              { text: '... (السورة كاملة) ...', numberInSurah: -1 },
              { text: lastData.data.text, numberInSurah: surah.numberOfAyahs }
            ]);
          }
        } else {
          const res = await fetch(`https://api.alquran.cloud/v1/surah/${selectedSurah}/quran-uthmani`);
          const data = await res.json();
          if (isMounted && data.code === 200) {
            const ayahs = data.data.ayahs.slice(startAyah - 1, endAyah);
            setPreviewAyahs(ayahs.map((a: any) => ({ text: a.text, numberInSurah: a.numberInSurah })));
          }
        }
      } catch (err) {
        console.error('Failed to fetch preview:', err);
      } finally {
        if (isMounted) setIsPreviewLoading(false);
      }
    };

    const timer = setTimeout(fetchPreview, 500);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [selectedSurah, startAyah, endAyah, surahs]);

  useEffect(() => {
    let isMounted = true;
    const calculateTotalDuration = async () => {
      if (startAyah > endAyah) return;
      setIsCalculatingDuration(true);
      let total = 0;
      try {
        const promises = [];
        for (let i = startAyah; i <= endAyah; i++) {
          const surahStr = selectedSurah.toString().padStart(3, '0');
          const ayahStr = i.toString().padStart(3, '0');
          const audioUrl = `/api/proxy?url=${encodeURIComponent(`https://everyayah.com/data/${selectedReciter}/${surahStr}${ayahStr}.mp3`)}`;
          promises.push(new Promise<number>((resolve) => {
            const audio = new Audio(audioUrl);
            audio.onloadedmetadata = () => resolve(audio.duration);
            audio.onerror = () => resolve(0);
          }));
        }
        const durations = await Promise.all(promises);
        total = durations.reduce((a, b) => a + b, 0);
        if (isMounted) setEstimatedDuration(total);
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) setIsCalculatingDuration(false);
      }
    };

    const timer = setTimeout(calculateTotalDuration, 800);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [selectedSurah, startAyah, endAyah, selectedReciter]);

  const searchVideos = async () => {
    setIsSearchingVideos(true);
    setVideoError('');
    try {
      const res = await fetch(`/api/videos?q=${encodeURIComponent(backgroundQuery)}&orientation=${videoFormat}`);
      const data = await res.json();
      if (res.ok && data.videos) {
        setVideos(data.videos);
        if (data.videos.length > 0) {
          // Find best quality portrait video
          const bestVideo = data.videos[0].video_files.find((v: any) => v.quality === 'hd' || v.quality === 'sd');
          if (bestVideo && selectedVideos.length === 0) {
            setSelectedVideos([bestVideo.link]);
          }
        }
      } else {
        setVideoError(data.error || 'Failed to fetch videos');
      }
    } catch (err) {
      console.error(err);
      setVideoError('Failed to fetch videos. Make sure the server is running.');
    } finally {
      setIsSearchingVideos(false);
    }
  };

  const formatDuration = (totalSeconds: number) => {
    if (totalSeconds === 0) return '0 ثانية';
    const m = Math.floor(totalSeconds / 60);
    const s = Math.ceil(totalSeconds % 60);
    if (m > 0) {
      return `${m} دقيقة و ${s} ثانية`;
    }
    return `${s} ثانية`;
  };

  const toggleVideoSelection = (url: string) => {
    setSelectedVideos(prev => {
      if (prev.includes(url)) {
        return prev.filter(v => v !== url);
      } else {
        return [...prev, url];
      }
    });
  };

  const generateReel = async () => {
    if (backgroundType === 'video' && selectedVideos.length === 0) {
      alert('الرجاء اختيار فيديو خلفية واحد على الأقل');
      return;
    }
    if (backgroundType === 'image' && !customImage) {
      alert('الرجاء رفع صورة للخلفية');
      return;
    }
    if (startAyah > endAyah) {
      alert('آية البداية يجب أن تكون أقل من أو تساوي آية النهاية');
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    setGeneratedVideoUrl(null);

    let audioCtx: AudioContext | null = null;
    const primedVideoElements: HTMLVideoElement[] = [];

    try {
      // Setup Audio Context immediately to capture user gesture
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
      }
      const dest = audioCtx.createMediaStreamDestination();

      // Prime videos synchronously to capture user gesture on iOS
      if (backgroundType === 'video') {
        for (const url of selectedVideos) {
          const v = document.createElement('video');
          v.crossOrigin = 'anonymous';
          v.muted = true;
          v.playsInline = true;
          v.src = `/api/proxy?url=${encodeURIComponent(url)}`;
          v.load();
          // Attempt to prime playback
          const playPromise = v.play();
          if (playPromise !== undefined) {
            playPromise.then(() => v.pause()).catch(() => {});
          } else {
            v.pause();
          }
          primedVideoElements.push(v);
        }
      }

      // Fetch Ayahs text
      const surahRes = await fetch(`https://api.alquran.cloud/v1/surah/${selectedSurah}/quran-uthmani`);
      const surahData = await surahRes.json();
      const ayahs: Ayah[] = surahData.data.ayahs.filter((a: Ayah) => a.numberInSurah >= startAyah && a.numberInSurah <= endAyah);

      if (ayahs.length === 0) {
        throw new Error('لم يتم العثور على آيات في هذا النطاق');
      }

      const canvas = document.createElement('canvas');
      let baseWidth = 1080;
      let baseHeight = 1920;
      
      if (videoFormat === 'landscape') {
        baseWidth = 1920;
        baseHeight = 1080;
      } else if (videoFormat === 'square') {
        baseWidth = 1080;
        baseHeight = 1080;
      }

      let scaleMultiplier = 1;
      if (videoQuality === '720p') scaleMultiplier = 720 / 1080;
      else if (videoQuality === '1440p') scaleMultiplier = 1440 / 1080;

      // Force max 720p on mobile devices to prevent crashes and lag
      const isMobile = window.innerWidth <= 768;
      if (isMobile && scaleMultiplier > 720 / 1080) {
        scaleMultiplier = 720 / 1080;
      }

      canvas.width = baseWidth * scaleMultiplier;
      canvas.height = baseHeight * scaleMultiplier;
      
      const scale = scaleMultiplier;
      const ctx = canvas.getContext('2d')!;

      // Preload audio and calculate text chunks
      try {
        await document.fonts.load(`${80 * scale}px "Amiri Quran"`);
      } catch (e) {
        console.warn('Failed to load Amiri Quran font, falling back to default.');
      }
      ctx.font = `normal ${80 * scale}px "Amiri Quran", Amiri, Arial`;
      const processedAyahs: any[] = [];
      let cumulativeTime = 0;
      
      for (let i = 0; i < ayahs.length; i++) {
        const ayahNum = ayahs[i].numberInSurah;
        const surahStr = selectedSurah.toString().padStart(3, '0');
        const ayahStr = ayahNum.toString().padStart(3, '0');
        const audioUrl = `/api/proxy?url=${encodeURIComponent(`https://everyayah.com/data/${selectedReciter}/${surahStr}${ayahStr}.mp3`)}`;
        
        const res = await fetch(audioUrl);
        if (!res.ok) throw new Error(`فشل تحميل الصوت للآية ${ayahNum}`);
        const arrayBuffer = await res.arrayBuffer();
        const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

        // Split text
        const text = ayahs[i].text;
        const words = text.split(' ');
        let line = '';
        const lines = [];
        const maxWidth = canvas.width - (160 * scale);

        for (let n = 0; n < words.length; n++) {
          const testLine = line + words[n] + ' ';
          const metrics = ctx.measureText(testLine);
          if (metrics.width > maxWidth && n > 0) {
            lines.push(line.trim());
            line = words[n] + ' ';
          } else {
            line = testLine;
          }
        }
        lines.push(line.trim());

        // Group into chunks of max 3 lines
        const chunksForAyah = [];
        const chunkTimes = [];
        const totalChars = text.replace(/\s+/g, '').length;
        let currentChunkStart = 0;

        // Estimate silence and stretch at the end of the Ayah
        // Mujawwad recitations have longer pauses. We estimate 1.5s as a baseline, plus 15% of duration, capped at 4s.
        const endPaddingTime = Math.min(Math.max(audioBuffer.duration * 0.15, 1.5), 4.0);
        // Ensure active duration is at least 50% of the total duration
        const activeDuration = Math.max(audioBuffer.duration - endPaddingTime, audioBuffer.duration * 0.5);

        for (let j = 0; j < lines.length; j += 3) {
          const chunkLines = lines.slice(j, j + 3);
          chunksForAyah.push(chunkLines);
          
          const chunkChars = chunkLines.join('').replace(/\s+/g, '').length;
          const isLastChunk = (j + 3 >= lines.length);
          
          // Avoid division by zero if text is empty
          let chunkDuration = totalChars > 0 ? (chunkChars / totalChars) * activeDuration : activeDuration;
          
          if (isLastChunk) {
            chunkDuration += (audioBuffer.duration - activeDuration);
          }
          
          chunkTimes.push({
            start: currentChunkStart,
            end: currentChunkStart + chunkDuration
          });
          currentChunkStart += chunkDuration;
        }

        processedAyahs.push({
          ...ayahs[i],
          chunks: chunksForAyah,
          chunkTimes: chunkTimes,
          audioBuffer: audioBuffer,
          startTime: cumulativeTime,
          endTime: cumulativeTime + audioBuffer.duration,
          duration: audioBuffer.duration
        });
        
        cumulativeTime += audioBuffer.duration;
      }
      const totalDuration = cumulativeTime;

      // Setup Background
      let loadedCustomImage: HTMLImageElement | null = null;
      if (backgroundType === 'image' && customImage) {
        loadedCustomImage = new Image();
        loadedCustomImage.crossOrigin = 'anonymous';
        loadedCustomImage.src = customImage;
        await new Promise((resolve) => {
          loadedCustomImage!.onload = resolve;
          loadedCustomImage!.onerror = resolve;
        });
      }

      // Setup Videos Array for 11s chunks
      const videoElements: HTMLVideoElement[] = primedVideoElements;
      let activeVideoIdx = 0;
      let prevVideoIdx = -1;
      let transitionStartTime = 0;
      let isTransitioning = false;
      let lastSwitchTime = performance.now();
      const CHUNK_DURATION_MS = 11000; // 11 seconds
      const TRANSITION_DURATION_MS = 1000; // 1 second transition

      if (backgroundType === 'video') {
        for (const v of videoElements) {
          if (v.readyState >= 3) continue;
          await new Promise((resolve) => {
            v.oncanplay = resolve;
            v.onerror = resolve;
          });
        }

        if (videoElements.length > 0) {
          await videoElements[0].play();
          
          // Wait for first frame to avoid black screen
          await new Promise<void>((resolve) => {
            const checkTime = () => {
              if (videoElements[0].currentTime > 0) {
                videoElements[0].removeEventListener('timeupdate', checkTime);
                resolve();
              }
            };
            videoElements[0].addEventListener('timeupdate', checkTime);
          });
        }
      }

      const fps = 24; // 24fps is smoother on mobile and looks cinematic
      const stream = canvas.captureStream ? canvas.captureStream(fps) : (canvas as any).mozCaptureStream ? (canvas as any).mozCaptureStream(fps) : null;
      if (!stream) {
        throw new Error('متصفحك لا يدعم تسجيل الفيديو من Canvas');
      }

      const combinedStream = new MediaStream([
        ...stream.getVideoTracks(),
        ...dest.stream.getAudioTracks()
      ]);

      const mimeTypes = [
        'video/mp4;codecs="avc1, mp4a.40.2"', // H.264 + AAC (Safari)
        'video/webm;codecs="vp9, opus"',      // VP9 + Opus (Chrome/Firefox)
        'video/webm;codecs="vp8, opus"',      // VP8 + Opus
        'video/webm',                         // WebM default
        'video/mp4'                           // MP4 fallback
      ];

      let supportedType = '';
      for (const type of mimeTypes) {
        if (MediaRecorder.isTypeSupported(type)) {
          supportedType = type;
          break;
        }
      }

      const options = supportedType ? { mimeType: supportedType } : undefined;
      const mediaRecorder = new MediaRecorder(combinedStream, options);
      setVideoExtension(supportedType?.includes('mp4') ? 'mp4' : 'webm');
      const chunks: BlobPart[] = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      const recordingPromise = new Promise<string>((resolve, reject) => {
        mediaRecorder.onstop = () => {
          if (chunks.length === 0) {
            reject(new Error("لم يتم تسجيل أي بيانات للفيديو. قد يكون هناك مشكلة في تحميل الصوت أو الفيديو."));
            return;
          }
          const blob = new Blob(chunks, { type: supportedType || 'video/webm' });
          resolve(URL.createObjectURL(blob));
        };
        mediaRecorder.onerror = (e: any) => {
          reject(new Error(`MediaRecorder error: ${e.error?.message || 'Unknown error'}`));
        };
      });

      mediaRecorder.start();

      let isRecording = true;
      const recordingStartTime = audioCtx.currentTime;

      // Schedule all audio buffers for gapless playback
      processedAyahs.forEach(ayah => {
        const source = audioCtx!.createBufferSource();
        source.buffer = ayah.audioBuffer;
        source.connect(dest);
        source.start(recordingStartTime + ayah.startTime);
      });

      const drawFrame = () => {
        if (!isRecording) return;
        requestAnimationFrame(drawFrame);

        const now = performance.now();
        const currentAudioTime = audioCtx!.currentTime - recordingStartTime;

        if (currentAudioTime >= totalDuration) {
          if (isRecording) {
            isRecording = false;
            if (mediaRecorder.state !== 'inactive') {
              try { mediaRecorder.requestData(); } catch (e) {}
              mediaRecorder.stop();
            }
            if (backgroundType === 'video') {
              videoElements.forEach(v => v.pause());
            }
          }
          return;
        }

        if (backgroundType === 'black') {
          ctx.fillStyle = 'black';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        } else if (backgroundType === 'image' && loadedCustomImage) {
          const imgRatio = loadedCustomImage.width / loadedCustomImage.height;
          const canvasRatio = canvas.width / canvas.height;
          let drawWidth, drawHeight, startX, startY;

          if (imgRatio > canvasRatio) {
            drawHeight = canvas.height;
            drawWidth = canvas.height * imgRatio;
            startX = (canvas.width - drawWidth) / 2;
            startY = 0;
          } else {
            drawWidth = canvas.width;
            drawHeight = canvas.width / imgRatio;
            startX = 0;
            startY = (canvas.height - drawHeight) / 2;
          }

          ctx.drawImage(loadedCustomImage, startX, startY, drawWidth, drawHeight);
          
          // Add dark overlay
          ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        } else if (backgroundType === 'video' && videoElements.length > 0) {
          let currentVideo = videoElements[activeVideoIdx];
          
          // Switch if 11 seconds passed OR video is about to end
          const isEnding = currentVideo.duration > 0 && currentVideo.currentTime >= currentVideo.duration - 0.2;
          
          if (!isTransitioning && selectedVideos.length > 1 && (now - lastSwitchTime >= CHUNK_DURATION_MS || isEnding)) {
            prevVideoIdx = activeVideoIdx;
            activeVideoIdx = (activeVideoIdx + 1) % videoElements.length;
            currentVideo = videoElements[activeVideoIdx];
            
            if (currentVideo.currentTime >= currentVideo.duration - 0.2) {
              currentVideo.currentTime = 0;
            }
            currentVideo.play().catch(console.error);
            
            if (transitionType !== 'none') {
              isTransitioning = true;
              transitionStartTime = now;
            } else {
              videoElements[prevVideoIdx].pause();
            }
            lastSwitchTime = now;
          }
          
          const drawVideoCover = (vid: HTMLVideoElement, alpha: number) => {
            if (vid.readyState < 2) return;
            ctx.globalAlpha = alpha;
            const videoRatio = vid.videoWidth / vid.videoHeight;
            const canvasRatio = canvas.width / canvas.height;
            let drawWidth, drawHeight, startX, startY;

            if (videoRatio > canvasRatio) {
              drawHeight = canvas.height;
              drawWidth = canvas.height * videoRatio;
              startX = (canvas.width - drawWidth) / 2;
              startY = 0;
            } else {
              drawWidth = canvas.width;
              drawHeight = canvas.width / videoRatio;
              startX = 0;
              startY = (canvas.height - drawHeight) / 2;
            }

            ctx.drawImage(vid, startX, startY, drawWidth, drawHeight);
            ctx.globalAlpha = 1.0;
          };

          if (isTransitioning) {
            const progress = Math.min((now - transitionStartTime) / TRANSITION_DURATION_MS, 1);
            
            if (transitionType === 'crossfade') {
              drawVideoCover(videoElements[prevVideoIdx], 1);
              drawVideoCover(videoElements[activeVideoIdx], progress);
            } else if (transitionType === 'fade') {
              if (progress < 0.5) {
                drawVideoCover(videoElements[prevVideoIdx], 1);
                ctx.fillStyle = `rgba(0, 0, 0, ${progress * 2})`;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
              } else {
                drawVideoCover(videoElements[activeVideoIdx], 1);
                ctx.fillStyle = `rgba(0, 0, 0, ${(1 - progress) * 2})`;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
              }
            }

            if (progress >= 1) {
              isTransitioning = false;
              videoElements[prevVideoIdx].pause();
            }
          } else {
            drawVideoCover(currentVideo, 1);
          }

          // Add dark overlay
          ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // Find current ayah
        const currentAyahIndex = processedAyahs.findIndex(a => currentAudioTime >= a.startTime && currentAudioTime < a.endTime);
        const currentAyah = currentAyahIndex !== -1 ? processedAyahs[currentAyahIndex] : processedAyahs[processedAyahs.length - 1];

        // Draw text
        if (currentAyah) {
          ctx.fillStyle = 'white';
          ctx.font = `normal ${80 * scale}px "Amiri Quran", Amiri, Arial`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.direction = 'rtl';

          const timeWithinAyah = currentAudioTime - currentAyah.startTime;
          let chunkIdx = currentAyah.chunkTimes.findIndex((t: any) => timeWithinAyah >= t.start && timeWithinAyah < t.end);
          if (chunkIdx === -1) chunkIdx = currentAyah.chunks.length - 1;
          if (isNaN(chunkIdx) || chunkIdx < 0) chunkIdx = 0;
          
          const lines = currentAyah.chunks[chunkIdx] || [];

          const lineHeight = 160 * scale;
          const totalHeight = lines.length * lineHeight;
          let startYText = (canvas.height - totalHeight) / 2;

          // Draw text shadow (using offset fill for better performance than shadowBlur)
          ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
          for (let i = 0; i < lines.length; i++) {
            ctx.fillText(lines[i], canvas.width / 2 + (4 * scale), startYText + (i * lineHeight) + (4 * scale));
          }

          // Draw main text
          ctx.fillStyle = 'white';
          for (let i = 0; i < lines.length; i++) {
            ctx.fillText(lines[i], canvas.width / 2, startYText + (i * lineHeight));
          }
          
          // Draw Info at the bottom
          const bottomTexts = [];
          if (showSurahName) {
            const surahName = surahs.find(s => s.number === selectedSurah)?.name || '';
            bottomTexts.push(surahName);
          }
          if (showAyahNumber) bottomTexts.push(`آية ${currentAyah.numberInSurah}`);
          if (showReciterName) {
            const reciterName = RECITERS.find(r => r.id === selectedReciter)?.name || '';
            bottomTexts.push(reciterName);
          }

          if (bottomTexts.length > 0) {
            ctx.font = `${40 * scale}px Cairo, Arial`;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.fillText(bottomTexts.join(' | '), canvas.width / 2, canvas.height - (150 * scale));
          }
        }

        setProgress((currentAudioTime / totalDuration) * 100);
      };

      drawFrame();
      const url = await recordingPromise;
      setGeneratedVideoUrl(url);

    } catch (err: any) {
      console.error(err);
      alert(`حدث خطأ أثناء إنشاء الفيديو: ${err.message}`);
    } finally {
      setIsGenerating(false);
      if (audioCtx && audioCtx.state !== 'closed') {
        audioCtx.close().catch(console.error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 font-sans" dir="rtl">
      {/* App Install Banner */}
      <div className="bg-emerald-50 border-b border-emerald-100 px-4 py-3 flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-4">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <img 
            src="https://image2url.com/r2/default/images/1772369115404-16a8ee29-6728-476a-9c29-76ebc3be8be4.png" 
            alt="في رحاب القرآن" 
            className="w-12 h-12 rounded-xl shadow-sm object-cover border border-emerald-100 shrink-0" 
          />
          <div className="flex-1">
            <h3 className="font-bold text-emerald-900 text-sm sm:text-base">تطبيق في رحاب القرآن</h3>
            <p className="text-xs sm:text-sm text-emerald-700">رفيقك اليومي للقرآن الكريم والأذكار، حمله الآن مجاناً</p>
          </div>
        </div>
        <a 
          href="https://play.google.com/store/apps/details?id=com.my.al.muslim.mquran" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap shadow-sm w-full sm:w-auto text-center"
        >
          تثبيت التطبيق
        </a>
      </div>

      <header className="bg-white border-b border-neutral-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-sm shrink-0">
              <Play className="w-6 h-6 fill-current" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-bold text-neutral-900 leading-tight">صانع فيديوهات القرآن</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-sm font-medium text-emerald-700">المبرمج/محمد جمعة</span>
                <span className="text-[10px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full border border-emerald-100">نسألكم الدعاء</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Controls Column */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Audio Settings */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-200">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Music className="w-5 h-5 text-emerald-600" />
                إعدادات الصوت والآيات
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">القارئ</label>
                  <select 
                    value={selectedReciter}
                    onChange={(e) => setSelectedReciter(e.target.value)}
                    className="w-full rounded-xl border-neutral-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 bg-neutral-50 px-4 py-2.5 border"
                  >
                    {RECITERS.map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-medium text-neutral-700">السورة</label>
                    <span className="text-xs text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded-md">
                      عدد الآيات: {surahs.find(s => s.number === selectedSurah)?.numberOfAyahs || 0}
                    </span>
                  </div>
                  <select 
                    value={selectedSurah}
                    onChange={(e) => setSelectedSurah(Number(e.target.value))}
                    className="w-full rounded-xl border-neutral-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 bg-neutral-50 px-4 py-2.5 border"
                  >
                    {surahs.map(s => (
                      <option key={s.number} value={s.number}>{s.number}. {s.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">من آية</label>
                    <input 
                      type="number" 
                      min={1}
                      max={surahs.find(s => s.number === selectedSurah)?.numberOfAyahs || 1}
                      value={startAyah || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === '') {
                          setStartAyah(0 as any); // temporary empty state
                          return;
                        }
                        const num = Number(val);
                        const max = surahs.find(s => s.number === selectedSurah)?.numberOfAyahs || 1;
                        if (num > max) setStartAyah(max);
                        else setStartAyah(num);
                      }}
                      onBlur={() => {
                        if (!startAyah || startAyah < 1) setStartAyah(1);
                        if (startAyah > endAyah) setEndAyah(startAyah);
                      }}
                      className="w-full rounded-xl border-neutral-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 bg-neutral-50 px-4 py-2.5 border"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">إلى آية</label>
                    <input 
                      type="number" 
                      min={startAyah || 1}
                      max={surahs.find(s => s.number === selectedSurah)?.numberOfAyahs || 1}
                      value={endAyah || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === '') {
                          setEndAyah(0 as any); // temporary empty state
                          return;
                        }
                        const num = Number(val);
                        const max = surahs.find(s => s.number === selectedSurah)?.numberOfAyahs || 1;
                        if (num > max) setEndAyah(max);
                        else setEndAyah(num);
                      }}
                      onBlur={() => {
                        const max = surahs.find(s => s.number === selectedSurah)?.numberOfAyahs || 1;
                        let finalEnd = endAyah;
                        if (!finalEnd || finalEnd < 1) finalEnd = 1;
                        if (finalEnd < startAyah) finalEnd = startAyah;
                        if (finalEnd > max) finalEnd = max;
                        setEndAyah(finalEnd);
                      }}
                      className="w-full rounded-xl border-neutral-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 bg-neutral-50 px-4 py-2.5 border"
                    />
                  </div>
                </div>

                {/* Ayah Preview */}
                <div className="bg-neutral-50 rounded-xl border border-neutral-200 overflow-hidden">
                  <button 
                    onClick={() => setShowPreview(!showPreview)}
                    className="w-full flex items-center justify-between p-3 text-sm font-medium text-neutral-700 hover:bg-neutral-100 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-emerald-600" />
                      معاينة الآيات المختارة
                    </span>
                    {showPreview ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  
                  {showPreview && (
                    <div className="p-4 border-t border-neutral-200 bg-white">
                      {isPreviewLoading ? (
                        <div className="flex justify-center py-4">
                          <div className="animate-spin rounded-full h-6 w-6 border-2 border-emerald-500 border-t-transparent"></div>
                        </div>
                      ) : previewAyahs.length > 0 ? (
                        <div className="text-right font-quran text-lg leading-loose text-neutral-800" dir="rtl">
                          {previewAyahs.map((ayah, idx) => (
                            <span key={idx}>
                              {ayah.numberInSurah === -1 ? (
                                <span className="text-emerald-600 font-bold mx-2 block text-center text-sm font-sans my-2">
                                  {ayah.text}
                                </span>
                              ) : (
                                <>
                                  {ayah.text}
                                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 text-xs mx-1 font-sans">
                                    {ayah.numberInSurah}
                                  </span>
                                </>
                              )}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center text-sm text-neutral-500 py-2">
                          لا توجد آيات لعرضها
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">مقاس الفيديو</label>
                    <select 
                      value={videoFormat}
                      onChange={(e) => setVideoFormat(e.target.value as any)}
                      className="w-full rounded-xl border-neutral-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 bg-neutral-50 px-4 py-2.5 border"
                    >
                      <option value="portrait">طولي (Reels/TikTok) 9:16</option>
                      <option value="landscape">عرضي (YouTube) 16:9</option>
                      <option value="square">مربع (Instagram) 1:1</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">جودة الفيديو</label>
                    <select 
                      value={videoQuality}
                      onChange={(e) => setVideoQuality(e.target.value as any)}
                      className="w-full rounded-xl border-neutral-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 bg-neutral-50 px-4 py-2.5 border"
                    >
                      <option value="720p">720p (HD)</option>
                      <option value="1080p">1080p (FHD)</option>
                      <option value="1440p">1440p (2K)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">الانتقال بين الفيديوهات</label>
                    <select 
                      value={transitionType}
                      onChange={(e) => setTransitionType(e.target.value as any)}
                      className="w-full rounded-xl border-neutral-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 bg-neutral-50 px-4 py-2.5 border"
                    >
                      <option value="crossfade">تلاشي متداخل (Crossfade)</option>
                      <option value="fade">تلاشي للأسود (Fade to Black)</option>
                      <option value="none">بدون انتقال (قطع مباشر)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <label className="block text-sm font-medium text-neutral-700">خيارات العرض</label>
                  <div className="flex flex-wrap gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={showSurahName} onChange={e => setShowSurahName(e.target.checked)} className="rounded text-emerald-600 focus:ring-emerald-500" />
                      <span className="text-sm text-neutral-600">اسم السورة</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={showAyahNumber} onChange={e => setShowAyahNumber(e.target.checked)} className="rounded text-emerald-600 focus:ring-emerald-500" />
                      <span className="text-sm text-neutral-600">رقم الآية</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={showReciterName} onChange={e => setShowReciterName(e.target.checked)} className="rounded text-emerald-600 focus:ring-emerald-500" />
                      <span className="text-sm text-neutral-600">اسم القارئ</span>
                    </label>
                  </div>
                </div>
                
                <div className="mt-4 p-4 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center justify-between">
                  <span className="text-emerald-800 font-medium">المدة التقريبية للمقطع:</span>
                  <span className="text-emerald-900 font-bold flex items-center gap-2">
                    {isCalculatingDuration ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      formatDuration(estimatedDuration)
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Background Settings */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-200">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-emerald-600" />
                خلفية الفيديو
              </h2>

              <div className="mb-6">
                <label className="block text-sm font-medium text-neutral-700 mb-2">نوع الخلفية</label>
                <div className="grid grid-cols-3 gap-2">
                  <button onClick={() => setBackgroundType('video')} className={cn("py-2 px-2 rounded-xl border text-sm font-medium transition-colors", backgroundType === 'video' ? "bg-emerald-50 border-emerald-500 text-emerald-700" : "bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50")}>فيديوهات</button>
                  <button onClick={() => setBackgroundType('black')} className={cn("py-2 px-2 rounded-xl border text-sm font-medium transition-colors", backgroundType === 'black' ? "bg-emerald-50 border-emerald-500 text-emerald-700" : "bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50")}>شاشة سوداء</button>
                  <button onClick={() => setBackgroundType('image')} className={cn("py-2 px-2 rounded-xl border text-sm font-medium transition-colors", backgroundType === 'image' ? "bg-emerald-50 border-emerald-500 text-emerald-700" : "bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50")}>صورة مخصصة</button>
                </div>
              </div>

              {backgroundType === 'video' && (
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="ابحث عن فيديو (مثال: nature, sky, space)"
                      value={backgroundQuery}
                      onChange={(e) => setBackgroundQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && searchVideos()}
                      className="flex-1 rounded-xl border-neutral-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 bg-neutral-50 px-4 py-2.5 border text-left"
                      dir="ltr"
                    />
                    <button 
                      onClick={searchVideos}
                      disabled={isSearchingVideos}
                      className="px-6 py-2.5 bg-neutral-900 text-white rounded-xl font-medium hover:bg-neutral-800 transition-colors disabled:opacity-50"
                    >
                      {isSearchingVideos ? <Loader2 className="w-5 h-5 animate-spin" /> : 'بحث'}
                    </button>
                  </div>

                  {videoError && (
                    <div className="p-4 bg-red-50 text-red-700 rounded-xl flex items-start gap-3 text-sm">
                      <AlertCircle className="w-5 h-5 shrink-0" />
                      <p>{videoError}</p>
                    </div>
                  )}

                  {videos.length > 0 && (
                    <>
                      <p className="text-sm text-neutral-500 mb-2">يمكنك اختيار أكثر من فيديو ليتم تشغيلهم بالتتابع</p>
                      <div className="grid grid-cols-3 gap-2 mt-2 max-h-[300px] overflow-y-auto p-1">
                        {videos.map(v => {
                          const videoFile = v.video_files.find(vf => vf.quality === 'hd' || vf.quality === 'sd') || v.video_files[0];
                          const isSelected = selectedVideos.includes(videoFile.link);
                          const selectionIndex = selectedVideos.indexOf(videoFile.link) + 1;
                          return (
                            <div 
                              key={v.id}
                              onClick={() => toggleVideoSelection(videoFile.link)}
                              className={cn(
                                "relative aspect-[9/16] rounded-lg overflow-hidden cursor-pointer border-2 transition-all",
                                isSelected ? "border-emerald-500 shadow-md scale-95" : "border-transparent hover:border-neutral-300"
                              )}
                            >
                              <img src={v.image} alt="Video thumbnail" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              {isSelected && (
                                <div className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center">
                                  <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold">
                                    {selectionIndex}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              )}

              {backgroundType === 'image' && (
                <div className="space-y-4">
                  <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-neutral-300 border-dashed rounded-xl cursor-pointer bg-neutral-50 hover:bg-neutral-100 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 text-neutral-500 mb-3" />
                      <p className="mb-2 text-sm text-neutral-500 font-medium">اضغط لرفع صورة</p>
                      <p className="text-xs text-neutral-400">PNG, JPG, WEBP</p>
                    </div>
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setCustomImage(URL.createObjectURL(file));
                      }
                    }} />
                  </label>
                  {customImage && (
                    <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-neutral-200">
                      <img src={customImage} alt="Custom background" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Generate Button */}
            <button
              onClick={generateReel}
              disabled={isGenerating || (backgroundType === 'video' && selectedVideos.length === 0) || (backgroundType === 'image' && !customImage)}
              className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold text-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  جاري المعالجة... {Math.round(progress)}%
                </>
              ) : (
                <>
                  <Settings className="w-6 h-6" />
                  إنشاء الريلز
                </>
              )}
            </button>
            
            {isGenerating && (
              <div className="mt-4">
                <div className="w-full bg-neutral-200 rounded-full h-2.5 overflow-hidden">
                  <div className="bg-emerald-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                </div>
                <p className="text-sm text-amber-600 mt-3 font-medium flex items-center gap-2 bg-amber-50 p-3 rounded-lg border border-amber-200">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  يرجى إبقاء هذه الصفحة مفتوحة وعدم التبديل إلى علامة تبويب أخرى أثناء إنشاء الفيديو لضمان جودة التسجيل.
                </p>
              </div>
            )}
          </div>

          {/* Preview Column */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center bg-neutral-100 rounded-3xl p-8 border border-neutral-200 min-h-[600px]">
            {generatedVideoUrl ? (
              <div className="w-full max-w-[360px] flex flex-col items-center gap-6">
                <div className="relative w-full aspect-[9/16] bg-black rounded-2xl overflow-hidden shadow-xl ring-1 ring-black/5">
                  <video 
                    src={generatedVideoUrl} 
                    controls 
                    autoPlay 
                    loop 
                    className="w-full h-full object-cover"
                  />
                </div>
                <a 
                  href={generatedVideoUrl} 
                  download={`quran-reel-${selectedSurah}-${startAyah}-${endAyah}.${videoExtension}`}
                  className="w-full py-3 bg-neutral-900 text-white rounded-xl font-medium hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  تحميل الفيديو
                </a>
              </div>
            ) : (
              <div className="text-center max-w-sm">
                <div className="w-20 h-20 bg-neutral-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Video className="w-10 h-10 text-neutral-400" />
                </div>
                <h3 className="text-xl font-bold text-neutral-900 mb-2">معاينة الفيديو</h3>
                <p className="text-neutral-500">
                  قم باختيار القارئ، السورة، الآيات، وفيديو الخلفية ثم اضغط على "إنشاء الريلز" لرؤية النتيجة هنا.
                </p>
              </div>
            )}
          </div>
          
        </div>
      </main>
    </div>
  );
}
