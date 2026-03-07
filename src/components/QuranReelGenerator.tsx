import React, { useState, useEffect, useRef } from 'react';
import { Play, Download, Loader2, Video, Settings, Music, Type, AlertCircle, Image as ImageIcon, Upload, BookOpen, ChevronDown, ChevronUp, CheckCircle2, RotateCcw, Volume2, Square, Heart, SkipBack, SkipForward, Repeat } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
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
  { id: 'Abdullah_Matroud_128kbps', name: 'عبد الله مطرود' },
  { id: 'Abdurrahmaan_As-Sudais_192kbps', name: 'عبد الرحمن السديس' },
  { id: 'Abu_Bakr_Ash-Shaatree_128kbps', name: 'أبو بكر الشاطري' },
  { id: 'ahmed_ibn_ali_al_ajamy_128kbps', name: 'أحمد بن علي العجمي' },
  { id: 'Alafasy_128kbps', name: 'مشاري راشد العفاسي' },
  { id: 'Ali_Hajjaj_AlSuesy_128kbps', name: 'علي حجاج السويسي' },
  { id: 'Ali_Jaber_64kbps', name: 'علي جابر' },
  { id: 'Ayman_Sowaid_64kbps', name: 'أيمن سويد' },
  { id: 'Fares_Abbad_64kbps', name: 'فارس عباد' },
  { id: 'Ghamadi_40kbps', name: 'سعد الغامدي' },
  { id: 'Hani_Rifai_192kbps', name: 'هاني الرفاعي' },
  { id: 'Hudhaify_128kbps', name: 'علي بن عبد الرحمن الحذيفي' },
  { id: 'Husary_128kbps', name: 'محمود خليل الحصري (مرتل)' },
  { id: 'Husary_Mujawwad_128kbps', name: 'محمود خليل الحصري (مجود)' },
  { id: 'Husary_Muallim_128kbps', name: 'محمود خليل الحصري (معلم)' },
  { id: 'Ibrahim_Akhdar_32kbps', name: 'إبراهيم الأخضر' },
  { id: 'Karim_Mansoori_128kbps', name: 'كريم منصوري' },
  { id: 'Khaalid_Abdullaah_al-Qahtaanee_192kbps', name: 'خالد القحطاني' },
  { id: 'MaherAlMuaiqly128kbps', name: 'ماهر المعيقلي' },
  { id: 'Menshawi_16kbps', name: 'محمد صديق المنشاوي (مرتل)' },
  { id: 'Minshawy_Mujawwad_192kbps', name: 'محمد صديق المنشاوي (مجود)' },
  { id: 'Minshawy_Teacher_128kbps', name: 'محمد صديق المنشاوي (معلم)' },
  { id: 'Mohammad_al_Tablaway_128kbps', name: 'محمد محمود الطبلاوي' },
  { id: 'Muhammad_Ayyoub_128kbps', name: 'محمد أيوب' },
  { id: 'Muhammad_Jibreel_128kbps', name: 'محمد جبريل' },
  { id: 'Muhsin_Al_Qasim_192kbps', name: 'عبد المحسن القاسم' },
  { id: 'Mustafa_Ismail_48kbps', name: 'مصطفى إسماعيل' },
  { id: 'Nasser_Alqatami_128kbps', name: 'ناصر القطامي' },
  { id: 'Parhizgar_48kbps', name: 'شهريار پرهيزگار' },
  { id: 'Sahl_Yassin_128kbps', name: 'سهل ياسين' },
  { id: 'Salaah_AbdulRahman_Bukhatir_128kbps', name: 'صلاح بو خاطر' },
  { id: 'Salah_Al_Budair_128kbps', name: 'صلاح البدير' },
  { id: 'Saood_ash-Shuraym_128kbps', name: 'سعود الشريم' },
  { id: 'Yaser_Salamah_128kbps', name: 'ياسر سلامة' },
  { id: 'Yasser_Ad-Dussary_128kbps', name: 'ياسر الدوسري' },
  { id: 'aziz_alili_128kbps', name: 'عزيز عليلي' },
  { id: 'khalefa_al_tunaiji_64kbps', name: 'خليفة الطنيجي' },
  { id: 'mahmoud_ali_al_banna_32kbps', name: 'محمود علي البنا' }
];

const BACKGROUND_IMAGES = [
  10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 28, 29, 46, 49, 54, 57, 58, 61, 62, 68, 69, 74, 97, 103, 104, 114, 119, 122, 124, 128, 136, 137, 142, 143, 147, 152, 154, 163, 167, 173
].map(id => `https://picsum.photos/id/${id}/1080/1920`);

const PLAYER_IMAGES = [
  175, 184, 188, 193, 197, 200, 201, 204, 206, 208, 209, 211, 212, 214, 215, 216, 218, 219, 222, 223, 225, 227, 228, 229, 230, 231, 232, 233, 234, 235, 236, 237, 238, 239, 240, 241, 242, 243, 244, 247
].map(id => `https://picsum.photos/id/${id}/800/800`);

export default function QuranReelGenerator() {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [selectedSurah, setSelectedSurah] = useState<number>(1);
  const [startAyah, setStartAyah] = useState<number>(1);
  const [endAyah, setEndAyah] = useState<number>(7);
  const [selectedReciter, setSelectedReciter] = useState<string>(RECITERS[0].id);
  
  const [videoFormat, setVideoFormat] = useState<'portrait' | 'landscape' | 'square'>('portrait');
  const [videoQuality, setVideoQuality] = useState<'240p' | '360p' | '480p' | '720p' | '1080p' | '1440p'>('720p');
  const [transitionType, setTransitionType] = useState<'crossfade' | 'fade' | 'none'>('crossfade');
  const [showSurahName, setShowSurahName] = useState(true);
  const [showAyahNumber, setShowAyahNumber] = useState(true);
  const [showReciterName, setShowReciterName] = useState(true);

  const [backgroundQuery, setBackgroundQuery] = useState<string>('nature');
  const [videos, setVideos] = useState<PexelsVideo[]>([]);
  const [selectedVideos, setSelectedVideos] = useState<string[]>([]);
  const [isSearchingVideos, setIsSearchingVideos] = useState(false);
  const [videoError, setVideoError] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  
  const [backgroundType, setBackgroundType] = useState<'video' | 'black' | 'image'>('video');
  const [customImage, setCustomImage] = useState<string | null>(null);

  const [designTemplate, setDesignTemplate] = useState<'default' | 'music-player'>('default');
  const [playerImage, setPlayerImage] = useState<string>(PLAYER_IMAGES[0]);
  const [playerImageCustom, setPlayerImageCustom] = useState<string | null>(null);
  const [playerBgImage, setPlayerBgImage] = useState<string>(BACKGROUND_IMAGES[0]);
  const [playerBgCustom, setPlayerBgCustom] = useState<string | null>(null);
  const [playerBgBlur, setPlayerBgBlur] = useState<number>(10);
  const [playerInfoColor, setPlayerInfoColor] = useState<string>('#ffffff');
  const [playerColor, setPlayerColor] = useState<string>('rgba(100, 80, 70, 0.7)');
  const [playerGradientColors, setPlayerGradientColors] = useState<{color: string, stop: number}[]>([
    {color: '#645046', stop: 0}, 
    {color: '#322823', stop: 100}
  ]);
  const [usePlayerGradient, setUsePlayerGradient] = useState(true);

  const [estimatedDuration, setEstimatedDuration] = useState(0);
  const [isCalculatingDuration, setIsCalculatingDuration] = useState(false);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generationStatus, setGenerationStatus] = useState<string>('');
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [videoExtension, setVideoExtension] = useState<string>('mp4');
  const [tasbeehIndex, setTasbeehIndex] = useState(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const audioPreviewRef = useRef<HTMLAudioElement | null>(null);

  const TASBEEH_WORDS = ['سُبْحَانَ اللَّهِ', 'الْحَمْدُ لِلَّهِ', 'لَا إِلَهَ إِلَّا اللَّهُ', 'اللَّهُ أَكْبَرُ', 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ'];

  useEffect(() => {
    // Stop preview when reciter changes
    if (audioPreviewRef.current) {
      audioPreviewRef.current.pause();
      setIsPlayingPreview(false);
    }
  }, [selectedReciter]);

  useEffect(() => {
    return () => {
      if (audioPreviewRef.current) {
        audioPreviewRef.current.pause();
      }
    };
  }, []);

  const togglePreview = () => {
    if (isPlayingPreview && audioPreviewRef.current) {
      audioPreviewRef.current.pause();
      setIsPlayingPreview(false);
    } else {
      if (!audioPreviewRef.current) {
        audioPreviewRef.current = new Audio();
        audioPreviewRef.current.addEventListener('ended', () => setIsPlayingPreview(false));
      }
      // Al-hamdu lillahi rabbil 'alamin is 001002
      const audioUrl = `/api/proxy?url=${encodeURIComponent(`https://everyayah.com/data/${selectedReciter}/001002.mp3`)}`;
      audioPreviewRef.current.src = audioUrl;
      audioPreviewRef.current.play().then(() => {
        setIsPlayingPreview(true);
      }).catch(err => {
        console.error("Failed to play preview:", err);
        setIsPlayingPreview(false);
      });
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isGenerating) {
      interval = setInterval(() => {
        setTasbeehIndex((prev) => (prev + 1) % TASBEEH_WORDS.length);
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  const [previewAyahs, setPreviewAyahs] = useState<{text: string, numberInSurah: number}[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  // Text Settings States
  const [showTextSettings, setShowTextSettings] = useState(false);
  const [fontFamily, setFontFamily] = useState('"Amiri Quran", Amiri, Arial');
  const [fontSize, setFontSize] = useState(60); // Default smaller size
  const [fontColor, setFontColor] = useState('#ffffff');
  const [fontWeight, setFontWeight] = useState('normal');
  const [lineHeightMultiplier, setLineHeightMultiplier] = useState(2);
  const [letterSpacing, setLetterSpacing] = useState(0);
  const [maxLinesPerSlide, setMaxLinesPerSlide] = useState(3);

  // Live Preview States
  const [previewState, setPreviewState] = useState<'idle' | 'loading' | 'playing'>('idle');
  const [currentPreviewText, setCurrentPreviewText] = useState<string>('');
  const [currentPreviewAyahNumber, setCurrentPreviewAyahNumber] = useState<number>(0);
  const [previewProgress, setPreviewProgress] = useState(0);
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);
  const isPreviewCancelled = useRef<boolean>(false);

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

  const stopPreview = () => {
    isPreviewCancelled.current = true;
    if (activeAudioRef.current) {
      activeAudioRef.current.pause();
      activeAudioRef.current.removeAttribute('src');
      activeAudioRef.current.load();
      activeAudioRef.current = null;
    }
    setPreviewState('idle');
    setCurrentPreviewText('');
  };

  const calculateTextChunks = (text: string, baseWidth: number, scale: number, limitLines?: number, customFontSize?: number, customMaxWidth?: number) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const actualFontSize = customFontSize !== undefined ? customFontSize : fontSize * scale;
    ctx.font = `${fontWeight} ${actualFontSize}px ${fontFamily}`;
    ctx.letterSpacing = `${letterSpacing * scale}px`;

    const words = text.split(' ');
    let line = '';
    const lines: string[] = [];
    const maxWidth = customMaxWidth !== undefined ? customMaxWidth : baseWidth * scale - (160 * scale);

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

    const chunks = [];
    const effectiveMaxLines = limitLines || maxLinesPerSlide;
    for (let j = 0; j < lines.length; j += effectiveMaxLines) {
      chunks.push(lines.slice(j, j + effectiveMaxLines));
    }
    return chunks;
  };

  const playLivePreview = async () => {
    if (previewState === 'playing') {
      stopPreview();
      return;
    }
    
    setPreviewState('loading');
    isPreviewCancelled.current = false;
    
    try {
      const surahRes = await fetch(`https://api.alquran.cloud/v1/surah/${selectedSurah}/quran-uthmani`);
      const surahData = await surahRes.json();
      const ayahs = surahData.data.ayahs.filter((a: any) => a.numberInSurah >= startAyah && a.numberInSurah <= endAyah);
      
      if (ayahs.length === 0) throw new Error('لا توجد آيات');

      const audioData = ayahs.map((ayah: any) => {
        const surahStr = selectedSurah.toString().padStart(3, '0');
        const ayahStr = ayah.numberInSurah.toString().padStart(3, '0');
        return {
          ...ayah,
          audioUrl: `/api/proxy?url=${encodeURIComponent(`https://everyayah.com/data/${selectedReciter}/${surahStr}${ayahStr}.mp3`)}`
        };
      });

      if (isPreviewCancelled.current) return;
      setPreviewState('playing');
      
      const baseWidth = videoFormat === 'landscape' ? 1920 : 1080;
      
      let totalPreviewDuration = 0;
      for (let i = 0; i < audioData.length; i++) {
        const audio = new Audio(audioData[i].audioUrl);
        await new Promise<void>((resolve) => {
          audio.onloadedmetadata = () => {
            totalPreviewDuration += audio.duration;
            resolve();
          };
          audio.onerror = () => resolve();
        });
      }
      
      let currentPreviewTime = 0;

      for (let i = 0; i < audioData.length; i++) {
        if (isPreviewCancelled.current) break;
        
        const item = audioData[i];
        
        let chunks;
        if (designTemplate === 'music-player') {
          const videoCqi = baseWidth / 100;
          const cardWidth = videoFormat === 'portrait' ? 80 * videoCqi : (videoFormat === 'square' ? 85 * videoCqi : 55 * videoCqi);
          const actualFontSize = (fontSize / 1080) * 80 * videoCqi;
          const actualMaxWidth = cardWidth * 0.9;
          chunks = calculateTextChunks(item.text, 0, 1, 1, actualFontSize, actualMaxWidth);
        } else {
          chunks = calculateTextChunks(item.text, baseWidth * 0.8, 1, maxLinesPerSlide);
        }
        
        const audio = new Audio(item.audioUrl);
        activeAudioRef.current = audio;
        
        await new Promise<void>((resolve) => {
          audio.onloadedmetadata = () => resolve();
          audio.onerror = () => resolve();
        });

        const totalChars = item.text.replace(/\s+/g, '').length;
        const endPaddingTime = Math.min(Math.max(audio.duration * 0.15, 1.5), 4.0);
        const activeDuration = Math.max(audio.duration - endPaddingTime, audio.duration * 0.5);

        const chunkTimes: {start: number, end: number, text: string}[] = [];
        let currentChunkStart = 0;

        for (let c = 0; c < chunks.length; c++) {
          const chunkLines = chunks[c];
          const chunkChars = chunkLines.join('').replace(/\s+/g, '').length;
          const isLastChunk = (c === chunks.length - 1);
          
          let chunkDuration = totalChars > 0 ? (chunkChars / totalChars) * activeDuration : activeDuration;
          if (isLastChunk) {
            chunkDuration += (audio.duration - activeDuration);
          }
          
          chunkTimes.push({
            start: currentChunkStart,
            end: currentChunkStart + chunkDuration,
            text: chunkLines.join('\n')
          });
          currentChunkStart += chunkDuration;
        }

        await new Promise<void>((resolve) => {
          audio.ontimeupdate = () => {
            const currentTime = audio.currentTime;
            const currentChunk = chunkTimes.find(ct => currentTime >= ct.start && currentTime < ct.end) || chunkTimes[chunkTimes.length - 1];
            if (currentChunk) {
              setCurrentPreviewText(currentChunk.text);
              setCurrentPreviewAyahNumber(item.numberInSurah);
            }
            if (totalPreviewDuration > 0) {
              setPreviewProgress(((currentPreviewTime + currentTime) / totalPreviewDuration) * 100);
            }
          };
          audio.onended = () => {
            currentPreviewTime += audio.duration;
            resolve();
          };
          audio.onerror = () => resolve();
          
          const playPromise = audio.play();
          if (playPromise !== undefined) {
            playPromise.catch(error => {
              if (error.name !== 'AbortError') {
                console.error("Audio playback failed:", error);
              }
              resolve();
            });
          } else {
            resolve();
          }
        });
      }
      
      if (!isPreviewCancelled.current) {
        setPreviewState('idle');
        setCurrentPreviewText('');
      }
    } catch (err) {
      console.error(err);
      setError('حدث خطأ أثناء تشغيل المعاينة');
      setPreviewState('idle');
    }
  };

  const generateReel = async () => {
    setError(null);
    if (designTemplate !== 'music-player') {
      if (backgroundType === 'video' && selectedVideos.length === 0) {
        setError('الرجاء اختيار فيديو خلفية واحد على الأقل');
        return;
      }
      if (backgroundType === 'image' && !customImage) {
        setError('الرجاء رفع صورة للخلفية');
        return;
      }
    }
    if (startAyah > endAyah) {
      setError('آية البداية يجب أن تكون أقل من أو تساوي آية النهاية');
      return;
    }

    setIsGenerating(true);
    setShowExportDialog(true);
    setProgress(0);
    setGenerationStatus('جاري تحضير بيئة العمل...');
    setGeneratedVideoUrl(null);
    abortControllerRef.current = new AbortController();

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

      let targetWidth = baseWidth;
      let targetHeight = baseHeight;

      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
      let effectiveQuality = videoQuality;
      
      // Cap quality on mobile to 480p max to prevent hardware encoder crashes and memory issues
      if (isMobileDevice && (videoQuality === '720p' || videoQuality === '1080p' || videoQuality === '1440p')) {
        effectiveQuality = '480p';
      }

      // Use exact standard resolutions for better hardware encoder compatibility
      if (effectiveQuality === '240p') {
        if (videoFormat === 'landscape') { targetWidth = 432; targetHeight = 240; }
        else if (videoFormat === 'square') { targetWidth = 240; targetHeight = 240; }
        else { targetWidth = 240; targetHeight = 432; }
      } else if (effectiveQuality === '360p') {
        if (videoFormat === 'landscape') { targetWidth = 640; targetHeight = 368; }
        else if (videoFormat === 'square') { targetWidth = 368; targetHeight = 368; }
        else { targetWidth = 368; targetHeight = 640; }
      } else if (effectiveQuality === '480p') {
        if (videoFormat === 'landscape') { targetWidth = 848; targetHeight = 480; }
        else if (videoFormat === 'square') { targetWidth = 480; targetHeight = 480; }
        else { targetWidth = 480; targetHeight = 848; }
      } else if (effectiveQuality === '720p') {
        if (videoFormat === 'landscape') { targetWidth = 1280; targetHeight = 720; }
        else if (videoFormat === 'square') { targetWidth = 720; targetHeight = 720; }
        else { targetWidth = 720; targetHeight = 1280; }
      } else if (effectiveQuality === '1080p') {
        if (videoFormat === 'landscape') { targetWidth = 1920; targetHeight = 1080; }
        else if (videoFormat === 'square') { targetWidth = 1080; targetHeight = 1080; }
        else { targetWidth = 1080; targetHeight = 1920; }
      } else if (effectiveQuality === '1440p') {
        if (videoFormat === 'landscape') { targetWidth = 2560; targetHeight = 1440; }
        else if (videoFormat === 'square') { targetWidth = 1440; targetHeight = 1440; }
        else { targetWidth = 1440; targetHeight = 2560; }
      }

      // Ensure canvas dimensions are multiples of 16 (strictly required by many hardware video encoders on Android)
      canvas.width = Math.round(targetWidth / 16) * 16;
      canvas.height = Math.round(targetHeight / 16) * 16;
      
      const scale = canvas.width / baseWidth; // Recalculate scale based on actual width
      const ctx = canvas.getContext('2d')!;

      // Preload audio and calculate text chunks
      try {
        const fontName = fontFamily.split(',')[0].replace(/"/g, '').trim();
        await document.fonts.load(`16px "${fontName}"`);
      } catch (e) {
        console.warn('Failed to load font, falling back to default.', e);
      }
      ctx.font = `${fontWeight} ${fontSize * scale}px ${fontFamily}`;
      ctx.letterSpacing = `${letterSpacing * scale}px`;
      
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

        // Group into chunks
        const chunksForAyah = [];
        const chunkTimes = [];
        const totalChars = text.replace(/\s+/g, '').length;
        let currentChunkStart = 0;

        // Estimate silence and stretch at the end of the Ayah
        // Mujawwad recitations have longer pauses. We estimate 1.5s as a baseline, plus 15% of duration, capped at 4s.
        const endPaddingTime = Math.min(Math.max(audioBuffer.duration * 0.15, 1.5), 4.0);
        // Ensure active duration is at least 50% of the total duration
        const activeDuration = Math.max(audioBuffer.duration - endPaddingTime, audioBuffer.duration * 0.5);

        for (let j = 0; j < lines.length; j += maxLinesPerSlide) {
          const chunkLines = lines.slice(j, j + maxLinesPerSlide);
          chunksForAyah.push(chunkLines);
          
          const chunkChars = chunkLines.join('').replace(/\s+/g, '').length;
          const isLastChunk = (j + maxLinesPerSlide >= lines.length);
          
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
      
      if (abortControllerRef.current?.signal.aborted) throw new Error('تم إلغاء التصدير');
      setGenerationStatus('جاري تحضير الخلفية...');
      setProgress(35);
      let loadedCustomImage: HTMLImageElement | null = null;
      let loadedPlayerBgImage: HTMLImageElement | null = null;
      let loadedPlayerBgCustom: HTMLImageElement | null = null;
      let loadedPlayerImage: HTMLImageElement | null = null;

      if (designTemplate === 'music-player') {
        if (playerBgCustom) {
          loadedPlayerBgCustom = new Image();
          loadedPlayerBgCustom.crossOrigin = 'anonymous';
          loadedPlayerBgCustom.src = playerBgCustom;
          await new Promise((resolve) => {
            loadedPlayerBgCustom!.onload = resolve;
            loadedPlayerBgCustom!.onerror = resolve;
          });
        }

        loadedPlayerBgImage = new Image();
        loadedPlayerBgImage.crossOrigin = 'anonymous';
        loadedPlayerBgImage.src = playerBgImage;
        await new Promise((resolve) => {
          loadedPlayerBgImage!.onload = resolve;
          loadedPlayerBgImage!.onerror = resolve;
        });

        loadedPlayerImage = new Image();
        loadedPlayerImage.crossOrigin = 'anonymous';
        loadedPlayerImage.src = playerImage;
        await new Promise((resolve) => {
          loadedPlayerImage!.onload = resolve;
          loadedPlayerImage!.onerror = resolve;
        });
      } else if (backgroundType === 'image' && customImage) {
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

      const fps = 30; // 30fps is standard and widely supported by hardware encoders
      const fpsInterval = 1000 / fps;
      let lastDrawTime = performance.now();

      // Draw an initial frame to ensure the canvas stream is initialized properly
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const stream = canvas.captureStream ? canvas.captureStream(fps) : (canvas as any).mozCaptureStream ? (canvas as any).mozCaptureStream(fps) : null;
      if (!stream) {
        throw new Error('متصفحك لا يدعم تسجيل الفيديو من Canvas');
      }

      const combinedStream = new MediaStream([
        ...stream.getVideoTracks(),
        ...dest.stream.getAudioTracks()
      ]);

      const isAndroid = /Android/i.test(navigator.userAgent);
      const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

      // Prioritize codecs based on the platform for maximum stability
      let mimeTypes: string[] = [];
      
      if (isAndroid) {
        // User requested MP4 on Android. With the 480p cap and 2.5Mbps bitrate,
        // H.264 should be much more stable now.
        mimeTypes = [
          'video/mp4;codecs="avc1, mp4a.40.2"', // H.264 + AAC
          'video/mp4',                          // MP4 default
          'video/webm;codecs="vp8, opus"',      // VP8 + Opus (Fallback)
          'video/webm;codecs="vp9, opus"',      // VP9 + Opus
          'video/webm'                          // WebM default
        ];
      } else if (isIOS) {
        // iOS prefers MP4/H.264
        mimeTypes = [
          'video/mp4;codecs="avc1, mp4a.40.2"', // H.264 + AAC
          'video/mp4'                           // MP4 default
        ];
      } else {
        // Desktop: Prioritize MP4, fallback to WebM
        mimeTypes = [
          'video/mp4;codecs="avc1, mp4a.40.2"', // H.264 + AAC
          'video/mp4',                          // MP4 default
          'video/webm;codecs="h264, opus"',     // H.264 in WebM container
          'video/webm;codecs="vp8, opus"',      // VP8 + Opus
          'video/webm;codecs="vp9, opus"',      // VP9 + Opus
          'video/webm'                          // WebM default
        ];
      }

      let supportedType = '';
      for (const type of mimeTypes) {
        if (MediaRecorder.isTypeSupported(type)) {
          supportedType = type;
          break;
        }
      }

      let mediaRecorder: MediaRecorder;
      try {
        // Use a lower bitrate for mobile to prevent encoder crashes (2.5 Mbps vs 5 Mbps)
        const videoBitsPerSecond = isMobileDevice ? 2500000 : 5000000;
        const options: any = supportedType ? { mimeType: supportedType, videoBitsPerSecond } : { videoBitsPerSecond };
        mediaRecorder = new MediaRecorder(combinedStream, options);
        // Force mp4 extension if we are using h264 or mp4, otherwise webm
        const isMp4 = supportedType?.includes('mp4') || supportedType?.includes('h264');
        setVideoExtension(isMp4 ? 'mp4' : 'webm');
      } catch (e) {
        console.warn("Failed to create MediaRecorder with specific options, falling back to default:", e);
        try {
          // If it fails, try without specifying videoBitsPerSecond (let the browser decide)
          const fallbackOptions: any = supportedType ? { mimeType: supportedType } : {};
          mediaRecorder = new MediaRecorder(combinedStream, fallbackOptions);
          const isMp4 = supportedType?.includes('mp4') || supportedType?.includes('h264');
          setVideoExtension(isMp4 ? 'mp4' : 'webm');
        } catch (fallbackError: any) {
          try {
            // Absolute last resort: no options at all
            mediaRecorder = new MediaRecorder(combinedStream);
            setVideoExtension(mediaRecorder.mimeType?.includes('mp4') ? 'mp4' : 'webm');
          } catch (finalError: any) {
            throw new Error(`تعذر بدء تسجيل الفيديو. التفاصيل: ${finalError.message}`);
          }
        }
      }
      const chunks: BlobPart[] = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      const recordingPromise = new Promise<string>((resolve, reject) => {
        mediaRecorder.onstop = () => {
          if (chunks.length === 0) {
            reject(new Error("لم يتم تسجيل أي بيانات للفيديو. قد يكون هناك مشكلة في تحميل الصوت أو الفيديو."));
            return;
          }
          // Force the blob type to video/mp4 if we determined it's mp4 compatible
          const finalMimeType = (supportedType?.includes('mp4') || supportedType?.includes('h264')) ? 'video/mp4' : (mediaRecorder.mimeType || supportedType || 'video/webm');
          const blob = new Blob(chunks, { type: finalMimeType });
          resolve(URL.createObjectURL(blob));
        };
        mediaRecorder.onerror = (e: any) => {
          reject(new Error(`MediaRecorder error: ${e.error?.message || 'Unknown error'}`));
        };
      });

      try {
        mediaRecorder.start(1000); // Record with timeslice to ensure data is emitted periodically
      } catch (startError: any) {
        throw new Error(`فشل بدء التسجيل الفعلي. التفاصيل: ${startError.message}`);
      }

      let isRecording = true;
      const recordingStartTime = audioCtx.currentTime;

      // Schedule all audio buffers for gapless playback
      processedAyahs.forEach(ayah => {
        const source = audioCtx!.createBufferSource();
        source.buffer = ayah.audioBuffer;
        source.connect(dest);
        source.start(recordingStartTime + ayah.startTime);
      });

      setGenerationStatus('جاري رسم وتصدير الإطارات...');

      let renderInterval: NodeJS.Timeout;

      const drawFrame = () => {
        if (!isRecording) {
          clearInterval(renderInterval);
          return;
        }
        
        if (abortControllerRef.current?.signal.aborted) {
          isRecording = false;
          clearInterval(renderInterval);
          if (mediaRecorder.state !== 'inactive') mediaRecorder.stop();
          return;
        }

        const now = performance.now();
        const elapsed = now - lastDrawTime;
        if (elapsed < fpsInterval) return;
        lastDrawTime = now - (elapsed % fpsInterval);
        const currentAudioTime = audioCtx!.currentTime - recordingStartTime;
        
        // Update progress (40% to 95%)
        const renderProgress = Math.min(95, 40 + Math.round((currentAudioTime / totalDuration) * 55));
        setProgress(renderProgress);

        // Add a small buffer (0.5s) to totalDuration to ensure the last frame is captured
        if (currentAudioTime >= totalDuration + 0.5) {
          if (isRecording) {
            isRecording = false;
            setGenerationStatus('جاري معالجة الملف النهائي...');
            setProgress(98);
            if (mediaRecorder.state !== 'inactive') {
              mediaRecorder.stop();
            }
            if (backgroundType === 'video') {
              videoElements.forEach(v => v.pause());
            }
          }
          return;
        }

        if (designTemplate === 'music-player' && (loadedPlayerBgImage || loadedPlayerBgCustom) && loadedPlayerImage) {
          const bgImg = loadedPlayerBgCustom || loadedPlayerBgImage;
          // Draw background image
          const imgRatio = bgImg.width / bgImg.height;
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

          // Apply blur to background
          ctx.filter = `blur(${playerBgBlur}px)`;
          ctx.drawImage(bgImg, startX - 40, startY - 40, drawWidth + 80, drawHeight + 80);
          ctx.filter = 'none';
          
          // Add dark overlay to background
          ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Draw glassmorphism card
          const videoCqi = canvas.width / 100;
          let cardWidth, cardHeight;
          if (videoFormat === 'portrait') {
            cardWidth = 80 * videoCqi;
            cardHeight = canvas.height * 0.70;
          } else if (videoFormat === 'square') {
            cardWidth = 85 * videoCqi;
            cardHeight = canvas.height * 0.85;
          } else {
            cardWidth = 55 * videoCqi;
            cardHeight = canvas.height * 0.80;
          }
          
          const cardX = (canvas.width - cardWidth) / 2;
          const cardY = (canvas.height - cardHeight) / 2;
          const cardRadius = 5 * videoCqi;

          // Draw card with gradient or solid color
          if (usePlayerGradient && playerGradientColors.length >= 2) {
            const gradient = ctx.createLinearGradient(cardX, cardY, cardX + cardWidth, cardY + cardHeight);
            playerGradientColors.forEach((grad) => {
              // Add transparency to gradient colors for glass effect
              const r = parseInt(grad.color.slice(1, 3), 16);
              const g = parseInt(grad.color.slice(3, 5), 16);
              const b = parseInt(grad.color.slice(5, 7), 16);
              gradient.addColorStop(grad.stop / 100, `rgba(${r}, ${g}, ${b}, 0.6)`);
            });
            ctx.fillStyle = gradient;
          } else {
            ctx.fillStyle = playerColor;
          }

          ctx.beginPath();
          ctx.moveTo(cardX + cardRadius, cardY);
          ctx.lineTo(cardX + cardWidth - cardRadius, cardY);
          ctx.quadraticCurveTo(cardX + cardWidth, cardY, cardX + cardWidth, cardY + cardRadius);
          ctx.lineTo(cardX + cardWidth, cardY + cardHeight - cardRadius);
          ctx.quadraticCurveTo(cardX + cardWidth, cardY + cardHeight, cardX + cardWidth - cardRadius, cardY + cardHeight);
          ctx.lineTo(cardX + cardRadius, cardY + cardHeight);
          ctx.quadraticCurveTo(cardX, cardY + cardHeight, cardX, cardY + cardHeight - cardRadius);
          ctx.lineTo(cardX, cardY + cardRadius);
          ctx.quadraticCurveTo(cardX, cardY, cardX + cardRadius, cardY);
          ctx.closePath();
          ctx.fill();

          // Add subtle border for glass effect
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
          ctx.lineWidth = 0.2 * videoCqi;
          ctx.stroke();

          // Draw player image inside card
          const p = 6 * videoCqi; // padding
          const playerImgSize = cardWidth * 0.75;
          const playerImgX = cardX + (cardWidth - playerImgSize) / 2;
          const playerImgY = cardY + p;
          const playerImgRadius = playerImgSize / 2; // Make it a circle

          ctx.save();
          ctx.beginPath();
          ctx.arc(playerImgX + playerImgRadius, playerImgY + playerImgRadius, playerImgRadius, 0, Math.PI * 2);
          ctx.closePath();
          ctx.clip();

          // Add rotation
          const rotationAngle = (currentAudioTime / 10) * Math.PI * 2; // Full rotation every 10 seconds
          ctx.translate(playerImgX + playerImgRadius, playerImgY + playerImgRadius);
          ctx.rotate(rotationAngle);
          ctx.drawImage(loadedPlayerImage, -playerImgRadius, -playerImgRadius, playerImgSize, playerImgSize);
          ctx.restore();

          // Draw Info
          const infoY = playerImgY + playerImgSize + (4 * videoCqi);
          const px = 2 * videoCqi;
          const textStartX = cardX + p + px;

          ctx.textAlign = 'left';
          ctx.direction = 'ltr';
          ctx.textBaseline = 'top';
          ctx.fillStyle = playerInfoColor;
          ctx.font = `bold ${4.5 * videoCqi}px Cairo, Arial`;
          const surahName = surahs.find(s => s.number === selectedSurah)?.name || '';
          ctx.fillText(`Surah ${surahName}`, textStartX, infoY);
          
          ctx.font = `500 ${3 * videoCqi}px Cairo, Arial`;
          ctx.fillStyle = playerInfoColor;
          ctx.globalAlpha = 0.8;
          const reciterName = RECITERS.find(r => r.id === selectedReciter)?.name || '';
          ctx.fillText(reciterName, textStartX, infoY + (5.5 * videoCqi));
          ctx.globalAlpha = 1.0;

          // Controls (Bottom up)
          const controlsY = cardY + cardHeight - (2 * videoCqi) - (6 * videoCqi); // pb-[2cqi] + half of 12cqi play button
          const progressBarY = controlsY - (6 * videoCqi) - (4 * videoCqi); // half of play button + mb-[4cqi]

          // Draw Ayah Text (Centered in the remaining space)
          const textSpaceTop = infoY + (10 * videoCqi); // infoY + info height + mb-[4cqi]
          const textSpaceBottom = progressBarY - (4 * videoCqi); // progressBarY - mb-[4cqi]
          const textCenterY = textSpaceTop + (textSpaceBottom - textSpaceTop) / 2;

          const currentAyahIndex = processedAyahs.findIndex(a => currentAudioTime >= a.startTime && currentAudioTime < a.endTime);
          const currentAyah = currentAyahIndex !== -1 ? processedAyahs[currentAyahIndex] : processedAyahs[processedAyahs.length - 1];

          if (currentAyah) {
            const timeWithinAyah = currentAudioTime - currentAyah.startTime;
            // Recalculate chunks with 1 line limit for music player
            const actualFontSize = (fontSize / 1080) * 80 * videoCqi;
            const actualMaxWidth = cardWidth * 0.9;
            const musicChunks = calculateTextChunks(currentAyah.text, 0, 1, 1, actualFontSize, actualMaxWidth);
            
            // Recalculate chunk times for the new chunks
            const totalChars = currentAyah.text.replace(/\s+/g, '').length;
            const ayahDuration = currentAyah.endTime - currentAyah.startTime;
            const endPaddingTime = Math.min(Math.max(ayahDuration * 0.15, 1.5), 4.0);
            const activeDuration = Math.max(ayahDuration - endPaddingTime, ayahDuration * 0.5);

            let currentChunkStart = 0;
            let currentChunkIdx = 0;
            for (let c = 0; c < musicChunks.length; c++) {
              const chunkChars = musicChunks[c].join('').replace(/\s+/g, '').length;
              const isLastChunk = (c === musicChunks.length - 1);
              let chunkDuration = totalChars > 0 ? (chunkChars / totalChars) * activeDuration : activeDuration;
              if (isLastChunk) chunkDuration += (ayahDuration - activeDuration);
              
              if (timeWithinAyah >= currentChunkStart && timeWithinAyah < currentChunkStart + chunkDuration) {
                currentChunkIdx = c;
                break;
              }
              currentChunkStart += chunkDuration;
            }

            const lines = musicChunks[currentChunkIdx] || [];
            ctx.fillStyle = fontColor;
            ctx.font = `${fontWeight} ${actualFontSize}px ${fontFamily}`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.direction = 'rtl';
            
            const lineHeight = actualFontSize * 1.5;
            const totalTextHeight = lines.length * lineHeight;
            const textY = textCenterY - (totalTextHeight / 2) + (lineHeight / 2);
            
            for (let i = 0; i < lines.length; i++) {
              ctx.fillText(lines[i], canvas.width / 2, textY + (i * lineHeight));
            }
          }

          // Progress Bar
          const progressBarWidth = cardWidth * 0.85;
          const progressBarX = cardX + (cardWidth - progressBarWidth) / 2;
          const progressPercent = Math.min(currentAudioTime / totalDuration, 1);

          ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
          ctx.beginPath();
          ctx.roundRect(progressBarX, progressBarY, progressBarWidth, 0.6 * videoCqi, 0.3 * videoCqi);
          ctx.fill();

          ctx.fillStyle = 'white';
          ctx.beginPath();
          ctx.roundRect(progressBarX, progressBarY, progressBarWidth * progressPercent, 0.6 * videoCqi, 0.3 * videoCqi);
          ctx.fill();

          // Time labels
          ctx.font = `${2.5 * videoCqi}px Courier New, monospace`;
          ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
          ctx.textAlign = 'left';
          ctx.textBaseline = 'top';
          ctx.direction = 'ltr';
          const formatTime = (s: number) => {
            const min = Math.floor(s / 60);
            const sec = Math.floor(s % 60);
            return `${min}:${sec.toString().padStart(2, '0')}`;
          };
          ctx.fillText(formatTime(currentAudioTime), progressBarX, progressBarY + (1.5 * videoCqi));
          ctx.textAlign = 'right';
          ctx.fillText(`-${formatTime(Math.max(0, totalDuration - currentAudioTime))}`, progressBarX + progressBarWidth, progressBarY + (1.5 * videoCqi));

          // Controls
          const centerX = canvas.width / 2;

          const drawSvgIcon = (paths: string[], x: number, y: number, size: number, color: string, fill = false) => {
            ctx.save();
            ctx.translate(x - size / 2, y - size / 2);
            const scale = size / 24;
            ctx.scale(scale, scale);
            ctx.strokeStyle = color;
            ctx.fillStyle = color;
            ctx.lineWidth = 2;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            paths.forEach(pathStr => {
              const p = new Path2D(pathStr);
              if (fill) ctx.fill(p);
              ctx.stroke(p);
            });
            ctx.restore();
          };

          // Play/Pause circle
          const playRadius = 6 * videoCqi;
          ctx.fillStyle = 'white';
          ctx.beginPath();
          ctx.arc(centerX, controlsY, playRadius, 0, Math.PI * 2);
          ctx.fill();

          // Pause icon (two vertical bars, rounded)
          const pauseColor = playerGradientColors[0]?.color || '#000000';
          ctx.fillStyle = pauseColor;
          ctx.beginPath();
          ctx.roundRect(centerX - (1.2 * videoCqi), controlsY - (2 * videoCqi), 1.2 * videoCqi, 4 * videoCqi, 0.6 * videoCqi);
          ctx.fill();
          ctx.beginPath();
          ctx.roundRect(centerX + (0.2 * videoCqi), controlsY - (2 * videoCqi), 1.2 * videoCqi, 4 * videoCqi, 0.6 * videoCqi);
          ctx.fill();

          // Skip backward (left)
          drawSvgIcon(['M19 20L9 12l10-8v16z', 'M5 19V5'], centerX - (10 * videoCqi), controlsY, 5 * videoCqi, 'rgba(255, 255, 255, 0.8)', false);

          // Skip forward (right)
          drawSvgIcon(['M5 4l10 8-10 8V4z', 'M19 5v14'], centerX + (10 * videoCqi), controlsY, 5 * videoCqi, 'rgba(255, 255, 255, 0.8)', false);

          // Heart icon (left)
          drawSvgIcon(['M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z'], progressBarX + (2.5 * videoCqi), controlsY, 5 * videoCqi, 'rgba(255, 255, 255, 0.8)', false);

          // Repeat icon (right)
          drawSvgIcon(['m17 2 4 4-4 4', 'M3 11v-1a4 4 0 0 1 4-4h14', 'm7 22-4-4 4-4', 'M21 13v1a4 4 0 0 1-4 4H3'], progressBarX + progressBarWidth - (2.5 * videoCqi), controlsY, 5 * videoCqi, 'rgba(255, 255, 255, 0.8)', false);

        } else if (backgroundType === 'black') {
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
        if (designTemplate !== 'music-player') {
          const currentAyahIndex = processedAyahs.findIndex(a => currentAudioTime >= a.startTime && currentAudioTime < a.endTime);
          const currentAyah = currentAyahIndex !== -1 ? processedAyahs[currentAyahIndex] : processedAyahs[processedAyahs.length - 1];

          // Draw text
          if (currentAyah) {
            ctx.fillStyle = fontColor;
            ctx.font = `${fontWeight} ${fontSize * scale}px ${fontFamily}`;
            ctx.letterSpacing = `${letterSpacing * scale}px`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.direction = 'rtl';

            const timeWithinAyah = currentAudioTime - currentAyah.startTime;
            let chunkIdx = currentAyah.chunkTimes.findIndex((t: any) => timeWithinAyah >= t.start && timeWithinAyah < t.end);
            if (chunkIdx === -1) chunkIdx = currentAyah.chunks.length - 1;
            if (isNaN(chunkIdx) || chunkIdx < 0) chunkIdx = 0;
            
            const lines = currentAyah.chunks[chunkIdx] || [];

            const lineHeight = (fontSize * lineHeightMultiplier) * scale;
            const totalHeight = lines.length * lineHeight;
            let startYText = (canvas.height - totalHeight) / 2;

            // Draw text shadow (using offset fill for better performance than shadowBlur)
            ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            for (let i = 0; i < lines.length; i++) {
              ctx.fillText(lines[i], canvas.width / 2 + (4 * scale), startYText + (i * lineHeight) + (4 * scale));
            }

            // Draw main text
            ctx.fillStyle = fontColor;
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
        }

        setProgress((currentAudioTime / totalDuration) * 100);
      };

      renderInterval = setInterval(drawFrame, fpsInterval / 2); // Run slightly faster than fps to catch frames
      const url = await recordingPromise;
      setGeneratedVideoUrl(url);

    } catch (err: any) {
      console.error(err);
      setError(`حدث خطأ أثناء إنشاء الفيديو: ${err.message}`);
      setShowExportDialog(false);
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

      <header className="bg-white border-b border-neutral-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 shrink-0 rounded-xl overflow-hidden shadow-sm bg-white flex items-center justify-center">
              <img src="https://image2url.com/r2/default/images/1772655483111-4e01c7d0-a57d-45ba-ad4a-6ad296d46b28.png" alt="Logo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
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
                  <div className="flex gap-2 items-center">
                    <select 
                      value={selectedReciter}
                      onChange={(e) => setSelectedReciter(e.target.value)}
                      className="flex-1 rounded-xl border-neutral-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 bg-neutral-50 px-4 py-2.5 border"
                    >
                      {RECITERS.map(r => (
                        <option key={r.id} value={r.id}>{r.name}</option>
                      ))}
                    </select>
                    <button
                      onClick={togglePreview}
                      className="h-[46px] w-[46px] shrink-0 flex items-center justify-center bg-emerald-100 text-emerald-700 rounded-xl hover:bg-emerald-200 transition-colors border border-emerald-200"
                      title={isPlayingPreview ? "إيقاف الاستماع" : "استمع لصوت القارئ (الحمد لله رب العالمين)"}
                    >
                      {isPlayingPreview ? <Square className="w-5 h-5 fill-current" /> : <Volume2 className="w-5 h-5" />}
                    </button>
                  </div>
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
                      <option value="240p">240p (منخفضة جداً)</option>
                      <option value="360p">360p (منخفضة)</option>
                      <option value="480p">480p (متوسطة)</option>
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

            {/* Text Settings */}
            <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden transition-all duration-300">
              <div 
                onClick={() => setShowTextSettings(!showTextSettings)}
                className="w-full flex items-center justify-between p-6 bg-white hover:bg-neutral-50 transition-colors cursor-pointer"
              >
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <Type className="w-5 h-5 text-emerald-600" />
                  إعدادات النص والخط
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setFontFamily('"Amiri Quran", Amiri, Arial');
                      setFontSize(60);
                      setFontColor('#ffffff');
                      setFontWeight('normal');
                      setLineHeightMultiplier(2);
                      setLetterSpacing(0);
                      setMaxLinesPerSlide(3);
                    }}
                    className="p-2 rounded-full bg-neutral-100 text-neutral-500 hover:bg-neutral-200 hover:text-emerald-600 transition-colors"
                    title="استعادة الإعدادات الافتراضية"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                  <div className={cn("p-2 rounded-full bg-emerald-50 text-emerald-600 transition-transform duration-300", showTextSettings ? "rotate-180" : "")}>
                    <ChevronDown className="w-5 h-5" />
                  </div>
                </div>
              </div>

              <div className={cn(
                "grid transition-all duration-300 ease-in-out",
                showTextSettings ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              )}>
                <div className="overflow-hidden">
                  <div className="p-6 pt-0 space-y-5 border-t border-neutral-100 mt-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">نوع الخط</label>
                      <select 
                        value={fontFamily}
                        onChange={(e) => setFontFamily(e.target.value)}
                        className="w-full rounded-xl border-neutral-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 bg-neutral-50 px-4 py-2.5 border"
                      >
                        <option value='"Amiri Quran", Amiri, Arial'>أميري قرآن (Amiri Quran)</option>
                        <option value='"Noto Naskh Arabic", Arial, sans-serif'>النسخ التقليدي (Naskh)</option>
                        <option value='"KFGQPC Uthman Taha Naskh", "Lateef", Arial, sans-serif'>عثمان طه (Hafs)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">سمك الخط</label>
                      <select 
                        value={fontWeight}
                        onChange={(e) => setFontWeight(e.target.value)}
                        className="w-full rounded-xl border-neutral-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 bg-neutral-50 px-4 py-2.5 border"
                      >
                        <option value="normal">عادي (Normal)</option>
                        <option value="bold">عريض (Bold)</option>
                        <option value="300">خفيف (Light)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">حجم الخط: {fontSize}</label>
                      <input 
                        type="range" 
                        min="30" max="150" 
                        value={fontSize} 
                        onChange={(e) => setFontSize(Number(e.target.value))}
                        className="w-full accent-emerald-600"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">لون الخط</label>
                      <div className="flex items-center gap-2">
                        <input 
                          type="color" 
                          value={fontColor} 
                          onChange={(e) => setFontColor(e.target.value)}
                          className="w-10 h-10 rounded cursor-pointer border-0 p-0"
                        />
                        <span className="text-sm text-neutral-500" dir="ltr">{fontColor}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">ارتفاع السطر: {lineHeightMultiplier}</label>
                      <input 
                        type="range" 
                        min="1" max="3" step="0.1"
                        value={lineHeightMultiplier} 
                        onChange={(e) => setLineHeightMultiplier(Number(e.target.value))}
                        className="w-full accent-emerald-600"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">المسافة بين الحروف: {letterSpacing}px</label>
                      <input 
                        type="range" 
                        min="-5" max="20" step="1"
                        value={letterSpacing} 
                        onChange={(e) => setLetterSpacing(Number(e.target.value))}
                        className="w-full accent-emerald-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">أقصى عدد سطور للشريحة: {maxLinesPerSlide}</label>
                    <input 
                      type="range" 
                      min="1" max="6" step="1"
                      value={maxLinesPerSlide} 
                      onChange={(e) => setMaxLinesPerSlide(Number(e.target.value))}
                      className="w-full accent-emerald-600"
                    />
                  </div>
                </div>
              </div>
            </div>
            </div>

            {/* Design Template Settings */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-200">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-emerald-600" />
                تصميم الفيديو
              </h2>
              
              <div className="grid grid-cols-2 gap-3 mb-6">
                <button 
                  onClick={() => setDesignTemplate('default')} 
                  className={cn("py-3 px-4 rounded-xl border text-sm font-bold transition-colors", designTemplate === 'default' ? "bg-emerald-50 border-emerald-500 text-emerald-700" : "bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50")}
                >
                  النمط الكلاسيكي
                </button>
                <button 
                  onClick={() => setDesignTemplate('music-player')} 
                  className={cn("py-3 px-4 rounded-xl border text-sm font-bold transition-colors", designTemplate === 'music-player' ? "bg-emerald-50 border-emerald-500 text-emerald-700" : "bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50")}
                >
                  نمط مشغل الصوت
                </button>
              </div>

              {designTemplate === 'music-player' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">صورة المشغل (الألبوم)</label>
                    <div className="grid grid-cols-5 gap-2 h-40 overflow-y-auto p-2 border rounded-xl bg-neutral-50 mb-3">
                      {PLAYER_IMAGES.map((img, idx) => (
                        <button
                          key={`player-${idx}`}
                          onClick={() => {
                            setPlayerImage(img);
                            setPlayerImageCustom(null);
                          }}
                          className={cn(
                            "relative aspect-square rounded-lg overflow-hidden border-2 transition-all",
                            (playerImage === img && !playerImageCustom) ? "border-emerald-500 scale-95 shadow-md" : "border-transparent hover:border-emerald-300"
                          )}
                        >
                          <img src={img} alt={`Player ${idx}`} className="w-full h-full object-cover" />
                          {(playerImage === img && !playerImageCustom) && (
                            <div className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center">
                              <CheckCircle2 className="w-6 h-6 text-white drop-shadow-md" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>

                    <label className="flex items-center justify-center w-full py-3 px-4 border-2 border-neutral-300 border-dashed rounded-xl cursor-pointer bg-neutral-50 hover:bg-neutral-100 transition-colors gap-2">
                      <Upload className="w-5 h-5 text-neutral-500" />
                      <span className="text-sm text-neutral-600 font-medium">أو ارفع صورة ألبوم خاصة</span>
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setPlayerImageCustom(URL.createObjectURL(file));
                        }
                      }} />
                    </label>
                    
                    {playerImageCustom && (
                      <div className="mt-3 relative aspect-square w-32 rounded-xl overflow-hidden border border-emerald-500 shadow-sm mx-auto">
                        <img src={playerImageCustom} className="w-full h-full object-cover" alt="Custom player image" />
                        <div className="absolute top-2 right-2 bg-emerald-500 text-white px-2 py-1 rounded-md text-[10px] font-bold">مفعلة</div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">صورة الخلفية</label>
                    <div className="grid grid-cols-5 gap-2 h-40 overflow-y-auto p-2 border rounded-xl bg-neutral-50 mb-3">
                      {BACKGROUND_IMAGES.map((img, idx) => (
                        <button
                          key={`bg-${idx}`}
                          onClick={() => {
                            setPlayerBgImage(img);
                            setPlayerBgCustom(null);
                          }}
                          className={cn(
                            "relative aspect-square rounded-lg overflow-hidden border-2 transition-all",
                            (playerBgImage === img && !playerBgCustom) ? "border-emerald-500 scale-95 shadow-md" : "border-transparent hover:border-emerald-300"
                          )}
                        >
                          <img src={img} alt={`Background ${idx}`} className="w-full h-full object-cover" />
                          {(playerBgImage === img && !playerBgCustom) && (
                            <div className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center">
                              <CheckCircle2 className="w-6 h-6 text-white drop-shadow-md" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                    
                    <label className="flex items-center justify-center w-full py-3 px-4 border-2 border-neutral-300 border-dashed rounded-xl cursor-pointer bg-neutral-50 hover:bg-neutral-100 transition-colors gap-2">
                      <Upload className="w-5 h-5 text-neutral-500" />
                      <span className="text-sm text-neutral-600 font-medium">أو ارفع صورة خلفية خاصة</span>
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setPlayerBgCustom(URL.createObjectURL(file));
                        }
                      }} />
                    </label>
                    
                    {playerBgCustom && (
                      <div className="mt-3 relative aspect-video rounded-xl overflow-hidden border border-emerald-500 shadow-sm">
                        <img src={playerBgCustom} className="w-full h-full object-cover" alt="Custom background" />
                        <div className="absolute top-2 right-2 bg-emerald-500 text-white px-2 py-1 rounded-md text-[10px] font-bold">مفعلة</div>
                      </div>
                    )}

                    <div className="mt-4">
                      <label className="block text-sm font-medium text-neutral-700 mb-1">قوة ضبابية الخلفية (Blur): {playerBgBlur}px</label>
                      <input 
                        type="range" 
                        min="0" max="50" step="1"
                        value={playerBgBlur} 
                        onChange={(e) => setPlayerBgBlur(Number(e.target.value))}
                        className="w-full accent-emerald-600"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">لون نصوص المشغل (السورة والقارئ)</label>
                      <div className="flex items-center gap-3">
                        <input 
                          type="color" 
                          value={playerInfoColor} 
                          onChange={(e) => setPlayerInfoColor(e.target.value)}
                          className="w-12 h-12 rounded-xl cursor-pointer border-2 border-white shadow-sm"
                        />
                        <span className="text-sm font-mono text-neutral-500" dir="ltr">{playerInfoColor}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t pt-4">
                      <label className="block text-sm font-medium text-neutral-700">لون البطاقة الزجاجية</label>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-neutral-500">تدرج ألوان</span>
                        <button 
                          onClick={() => setUsePlayerGradient(!usePlayerGradient)}
                          className={cn(
                            "w-10 h-5 rounded-full relative transition-colors",
                            usePlayerGradient ? "bg-emerald-500" : "bg-neutral-300"
                          )}
                        >
                          <div className={cn(
                            "absolute top-1 w-3 h-3 bg-white rounded-full transition-all",
                            usePlayerGradient ? "right-1" : "right-6"
                          )} />
                        </button>
                      </div>
                    </div>

                    {usePlayerGradient ? (
                      <div className="space-y-3">
                        <div className="flex flex-col gap-4">
                          {playerGradientColors.map((grad, idx) => (
                            <div key={`grad-${idx}`} className="flex items-center gap-3 bg-neutral-50 p-3 rounded-xl border border-neutral-100">
                              <input 
                                type="color" 
                                value={grad.color} 
                                onChange={(e) => {
                                  const newColors = [...playerGradientColors];
                                  newColors[idx].color = e.target.value;
                                  setPlayerGradientColors(newColors);
                                }}
                                className="w-10 h-10 rounded-lg cursor-pointer border-2 border-white shadow-sm shrink-0"
                              />
                              <div className="flex-1">
                                <div className="flex justify-between mb-1">
                                  <span className="text-xs font-medium text-neutral-600">نسبة اللون</span>
                                  <span className="text-xs font-mono text-neutral-500">{grad.stop}%</span>
                                </div>
                                <input 
                                  type="range" 
                                  min="0" max="100" step="1"
                                  value={grad.stop} 
                                  onChange={(e) => {
                                    const newColors = [...playerGradientColors];
                                    newColors[idx].stop = Number(e.target.value);
                                    setPlayerGradientColors(newColors);
                                  }}
                                  className="w-full accent-emerald-600"
                                />
                              </div>
                            </div>
                          ))}
                          <button 
                            onClick={() => {
                              if (playerGradientColors.length < 3) {
                                setPlayerGradientColors([...playerGradientColors, {color: '#000000', stop: 100}]);
                              } else {
                                setPlayerGradientColors(playerGradientColors.slice(0, 2));
                              }
                            }}
                            className="w-full py-2 rounded-xl border-2 border-dashed border-neutral-300 flex items-center justify-center text-neutral-500 hover:border-emerald-400 hover:text-emerald-600 transition-colors text-sm font-medium"
                          >
                            {playerGradientColors.length < 3 ? 'إضافة لون جديد +' : 'إزالة اللون الأخير -'}
                          </button>
                        </div>
                        <div 
                          className="w-full h-8 rounded-lg shadow-inner border border-white/20 mt-4"
                          style={{ background: `linear-gradient(to right, ${playerGradientColors.map(g => `${g.color} ${g.stop}%`).join(', ')})` }}
                        />
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <input 
                          type="color" 
                          value={(() => {
                            if (playerColor.startsWith('rgba')) {
                              const match = playerColor.match(/rgba\((\d+),\s*(\d+),\s*(\d+)/);
                              if (match) {
                                const r = parseInt(match[1]).toString(16).padStart(2, '0');
                                const g = parseInt(match[2]).toString(16).padStart(2, '0');
                                const b = parseInt(match[3]).toString(16).padStart(2, '0');
                                return `#${r}${g}${b}`;
                              }
                            }
                            return '#645046';
                          })()}
                          onChange={(e) => {
                            const hex = e.target.value;
                            const r = parseInt(hex.slice(1, 3), 16);
                            const g = parseInt(hex.slice(3, 5), 16);
                            const b = parseInt(hex.slice(5, 7), 16);
                            setPlayerColor(`rgba(${r}, ${g}, ${b}, 0.7)`);
                          }}
                          className="w-12 h-12 rounded-xl cursor-pointer border-2 border-white shadow-sm"
                        />
                        <div className="flex-1 h-12 rounded-xl border flex items-center px-4" style={{ backgroundColor: playerColor }}>
                          <span className="text-white font-medium drop-shadow-md">معاينة اللون</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Background Settings */}
            {designTemplate !== 'music-player' && (
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
            )}
          </div>

          {/* Preview Column */}
          <div className="lg:col-span-7 flex flex-col items-center justify-start bg-neutral-100 rounded-3xl p-4 sm:p-8 border border-neutral-200 min-h-[600px]">
            <div className="w-full max-w-[360px] flex flex-col items-center gap-4 sticky top-24">
              
              <div className="w-full flex justify-between items-center mb-2">
                <h3 className="font-bold text-neutral-800 text-lg">المعاينة الحية</h3>
                <button 
                  onClick={playLivePreview} 
                  disabled={previewState === 'loading'}
                  className={cn(
                    "px-4 py-2 rounded-xl text-sm font-bold transition-colors flex items-center gap-2",
                    previewState === 'playing' 
                      ? "bg-red-100 text-red-700 hover:bg-red-200" 
                      : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                  )}
                >
                  {previewState === 'loading' ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> جاري التحضير...</>
                  ) : previewState === 'playing' ? (
                    <><Video className="w-4 h-4" /> إيقاف المعاينة</>
                  ) : (
                    <><Play className="w-4 h-4" /> تشغيل بالصوت</>
                  )}
                </button>
              </div>

              {/* Live Preview Box */}
              <div 
                className="relative w-full bg-black rounded-2xl overflow-hidden shadow-xl ring-1 ring-black/5 flex flex-col"
                style={{ aspectRatio: videoFormat === 'portrait' ? '9/16' : videoFormat === 'landscape' ? '16/9' : '1/1' }}
              >
                {/* Background Layer */}
                {designTemplate === 'music-player' ? (
                  <>
                    <img 
                      src={playerBgCustom || playerBgImage} 
                      className="absolute inset-0 w-full h-full object-cover scale-110" 
                      style={{ filter: `blur(${playerBgBlur}px)` }}
                      alt="Background" 
                    />
                    <div className="absolute inset-0 bg-black/40" />
                  </>
                ) : (
                  <>
                    {backgroundType === 'video' && selectedVideos.length > 0 && (
                      <video 
                        src={`/api/proxy?url=${encodeURIComponent(selectedVideos[0])}`} 
                        autoPlay 
                        loop 
                        muted 
                        playsInline 
                        className="absolute inset-0 w-full h-full object-cover" 
                      />
                    )}
                    {backgroundType === 'image' && customImage && (
                      <img src={customImage} className="absolute inset-0 w-full h-full object-cover" alt="Background" />
                    )}
                    <div className="absolute inset-0 bg-black/50" />
                  </>
                )}
                
                {/* Content Layer */}
                {designTemplate === 'music-player' ? (
                  <div className="absolute inset-0 flex items-center justify-center p-[4cqi] z-10">
                    <div 
                      className="w-[80cqi] h-[70%] rounded-[5cqi] flex flex-col items-center p-[6cqi] relative overflow-hidden backdrop-blur-2xl border border-white/20 shadow-2xl"
                      style={{ 
                        background: usePlayerGradient && playerGradientColors.length >= 2
                          ? `linear-gradient(135deg, ${playerGradientColors.map(c => `${c.color}99 ${c.stop}%`).join(', ')})`
                          : playerColor 
                      }}
                    >
                      {/* Player Image */}
                      <div className="w-[75%] aspect-square rounded-full overflow-hidden mb-[4cqi] shadow-2xl border border-white/10 shrink-0 relative flex items-center justify-center">
                        <img 
                          src={playerImageCustom || playerImage} 
                          className="w-full h-full object-cover absolute inset-0" 
                          alt="Player" 
                          style={{ 
                            animation: previewState === 'playing' ? 'spin 10s linear infinite' : 'none' 
                          }}
                        />
                      </div>
                      
                      {/* Info */}
                      <div className="w-full text-left mb-[4cqi] px-[2cqi] shrink-0">
                        <h4 className="font-bold tracking-tight line-clamp-1" style={{ color: playerInfoColor, fontSize: '4.5cqi', marginBottom: '0.5cqi' }}>Surah {surahs.find(s => s.number === selectedSurah)?.name}</h4>
                        <p className="font-medium line-clamp-1" style={{ color: playerInfoColor, opacity: 0.8, fontSize: '3cqi' }}>{RECITERS.find(r => r.id === selectedReciter)?.name}</p>
                      </div>
                      
                      {/* Ayah Text */}
                      <div className="flex-1 flex items-center justify-center w-full mb-[4cqi] px-[2cqi] overflow-hidden">
                        <p 
                          className="text-center leading-relaxed transition-all duration-500"
                          style={{ 
                            fontFamily: fontFamily,
                            fontWeight: fontWeight,
                            color: fontColor,
                            fontSize: `${(fontSize / 1080) * 80}cqi`, 
                            textShadow: '0 0.4cqi 1.2cqi rgba(0,0,0,0.3)' 
                          }}
                        >
                          {currentPreviewText || (previewAyahs.length > 0 ? (() => {
                            const baseWidth = videoFormat === 'landscape' ? 1920 : 1080;
                            const videoCqi = baseWidth / 100;
                            const cardWidth = videoFormat === 'portrait' ? 80 * videoCqi : (videoFormat === 'square' ? 85 * videoCqi : 55 * videoCqi);
                            const actualFontSize = (fontSize / 1080) * 80 * videoCqi;
                            const actualMaxWidth = cardWidth * 0.9;
                            return calculateTextChunks(previewAyahs[0].text, 0, 1, 1, actualFontSize, actualMaxWidth)[0]?.join('\n');
                          })() : 'جاري تحميل الآيات...')}
                        </p>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="w-[85%] mb-[4cqi] shrink-0">
                        <div className="w-full h-[0.6cqi] bg-white/20 rounded-full relative overflow-hidden">
                          <motion.div 
                            className="absolute left-0 top-0 h-full bg-white rounded-full"
                            animate={{ width: `${previewProgress}%` }}
                            transition={{ type: 'spring', bounce: 0, duration: 0.5 }}
                          />
                        </div>
                        <div className="flex justify-between text-white/60 mt-[1.5cqi] font-mono tracking-tighter" style={{ fontSize: '2.5cqi' }}>
                          <span>0:00</span>
                          <span>-0:00</span>
                        </div>
                      </div>
                      
                      {/* Controls */}
                      <div className="w-[85%] flex items-center justify-between mt-auto shrink-0 pb-[2cqi]">
                        <button className="text-white/80 hover:text-white transition-colors"><Heart style={{ width: '5cqi', height: '5cqi' }} /></button>
                        <div className="flex items-center gap-[6cqi]">
                          <button className="text-white/80 hover:text-white transition-colors"><SkipBack style={{ width: '5cqi', height: '5cqi' }} /></button>
                          <div className="bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform cursor-pointer shrink-0" style={{ width: '12cqi', height: '12cqi' }}>
                            {previewState === 'playing' ? (
                              <div className="flex gap-[1cqi]">
                                <div className="bg-neutral-900 rounded-full" style={{ width: '1.2cqi', height: '4cqi' }}></div>
                                <div className="bg-neutral-900 rounded-full" style={{ width: '1.2cqi', height: '4cqi' }}></div>
                              </div>
                            ) : (
                              <Play className="text-neutral-900" style={{ width: '5cqi', height: '5cqi', marginLeft: '0.5cqi' }} />
                            )}
                          </div>
                          <button className="text-white/80 hover:text-white transition-colors"><SkipForward style={{ width: '5cqi', height: '5cqi' }} /></button>
                        </div>
                        <button className="text-white/80 hover:text-white transition-colors"><Repeat style={{ width: '5cqi', height: '5cqi' }} /></button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Text Layer */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4 sm:p-6 text-center z-10">
                      <p 
                        className="leading-loose whitespace-pre-wrap" 
                        style={{ 
                          fontFamily: fontFamily,
                          fontWeight: fontWeight,
                          color: fontColor,
                          fontSize: `${(fontSize / 1080) * 100}cqi`, 
                          lineHeight: lineHeightMultiplier,
                          letterSpacing: `${letterSpacing}px`,
                          textShadow: '0 2px 10px rgba(0,0,0,0.8)' 
                        }}
                      >
                        {currentPreviewText || (previewAyahs.length > 0 ? calculateTextChunks(previewAyahs[0].text, videoFormat === 'landscape' ? 1920 : 1080, 1)[0]?.join('\n') : 'جاري تحميل الآيات...')}
                      </p>
                    </div>

                    {/* Info Layer */}
                    <div className="absolute bottom-6 left-0 right-0 flex justify-center items-center gap-2 text-white/90 text-[10px] sm:text-xs font-medium z-10 drop-shadow-md">
                      {showSurahName && <span>{surahs.find(s => s.number === selectedSurah)?.name}</span>}
                      {showSurahName && (showAyahNumber || showReciterName) && <span>|</span>}
                      {showAyahNumber && <span>آية {currentPreviewAyahNumber || startAyah}</span>}
                      {showAyahNumber && showReciterName && <span>|</span>}
                      {showReciterName && <span>{RECITERS.find(r => r.id === selectedReciter)?.name}</span>}
                    </div>
                  </>
                )}
                
                {/* Container Query Wrapper for Font Scaling */}
                <style>{`
                  .relative.w-full.bg-black {
                    container-type: inline-size;
                  }
                `}</style>
              </div>

              {/* Generate Button */}
              <div className="w-full mt-6">
                {error && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-700">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <p className="text-sm font-medium">{error}</p>
                  </div>
                )}
                <button
                  onClick={generateReel}
                  disabled={isGenerating || (designTemplate !== 'music-player' && ((backgroundType === 'video' && selectedVideos.length === 0) || (backgroundType === 'image' && !customImage)))}
                  className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold text-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
                >
                  <Download className="w-6 h-6" />
                  تصدير الفيديو النهائي
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      {/* Export Dialog Overlay */}
      <AnimatePresence>
        {showExportDialog && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col items-center p-8 relative"
            >
              {/* Rotating Tasbeeh */}
              <div className="absolute top-0 left-0 right-0 overflow-hidden h-14 bg-emerald-50 border-b border-emerald-100 flex items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={tasbeehIndex}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-emerald-800 font-bold text-lg font-quran"
                  >
                    {TASBEEH_WORDS[tasbeehIndex]}
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="mt-14 flex flex-col items-center w-full">
                {generatedVideoUrl && !isGenerating ? (
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex flex-col items-center w-full"
                  >
                    <div className="w-28 h-28 mb-6 flex items-center justify-center bg-emerald-100 rounded-full">
                      <CheckCircle2 className="w-14 h-14 text-emerald-600" />
                    </div>
                    <h3 className="text-xl font-bold text-neutral-900 mb-2">تم إنشاء الفيديو بنجاح!</h3>
                    <p className="text-sm text-neutral-500 text-center mb-8">
                      الفيديو جاهز للتحميل والمشاركة
                    </p>
                    
                    <a 
                      href={generatedVideoUrl} 
                      download={`quran-reel-${selectedSurah}-${startAyah}-${endAyah}.${videoExtension}`}
                      onClick={() => setShowExportDialog(false)}
                      className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold text-lg hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 mb-3"
                    >
                      <Download className="w-6 h-6" />
                      تحميل الفيديو ({videoExtension.toUpperCase()})
                    </a>
                    
                    <button 
                      onClick={() => setShowExportDialog(false)}
                      className="w-full py-3 px-4 bg-neutral-100 text-neutral-600 hover:bg-neutral-200 rounded-xl font-medium transition-colors"
                    >
                      إغلاق
                    </button>
                  </motion.div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center w-full"
                  >
                    {/* Circular Progress */}
                    <div className="relative w-32 h-32 mb-6">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        <circle 
                          cx="50" cy="50" r="45" 
                          fill="none" 
                          stroke="#ecfdf5" 
                          strokeWidth="8"
                        />
                        <circle 
                          cx="50" cy="50" r="45" 
                          fill="none" 
                          stroke="#059669" 
                          strokeWidth="8"
                          strokeLinecap="round"
                          strokeDasharray={`${2 * Math.PI * 45}`}
                          strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
                          className="transition-all duration-300 ease-out"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center flex-col">
                        <span className="text-2xl font-bold text-emerald-700">{Math.round(progress)}%</span>
                      </div>
                    </div>

                    <h3 className="text-xl font-bold text-neutral-900 mb-2">جاري إنشاء الفيديو</h3>
                    <p className="text-sm text-neutral-500 text-center mb-8 h-10 flex items-center justify-center">
                      {generationStatus}
                    </p>

                    <button 
                      onClick={() => {
                        abortControllerRef.current?.abort();
                        setIsGenerating(false);
                        setShowExportDialog(false);
                      }}
                      className="w-full py-3 px-4 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl font-medium transition-colors"
                    >
                      إلغاء التصدير
                    </button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
