document.addEventListener('DOMContentLoaded', () => {
  const trackData = [
    { title: 'Fake Happy', artist: 'Paramore', art: 'images/album1.jpg', src: 'audio/fake_happy.mp3' },
    { title: 'Caught In The Middle', artist: 'Paramore', art: 'images/album2.jpg', src: 'audio/caught_in_the_middle.mp3' },
    { title: 'Still Into You', artist: 'Paramore', art: 'images/album3.jpg', src: 'audio/still_into_you.mp3' },
    { title: 'Decode', artist: 'Paramore', art: 'images/album4.jpg', src: 'audio/decode.mp3' },
    { title: 'Misery Business', artist: 'Paramore', art: 'images/album5.jpg', src: 'audio/misery_business.mp3' },
    { title: 'Brick By Boring Brick', artist: 'Paramore', art: 'images/album6.jpg', src: 'audio/brick_by_boring_brick.mp3' },
    { title: 'All I Wanted', artist: 'Paramore', art: 'images/album7.jpg', src: 'audio/all_i_wanted.mp3' },
    { title: 'Be Alone', artist: 'Paramore', art: 'images/album8.jpg', src: 'audio/be_alone.mp3' },
    { title: 'Hallelujah', artist: 'Paramore', art: 'images/album9.jpg', src: 'audio/hallelujah.mp3' },
    { title: 'Monster', artist: 'Paramore', art: 'images/album10.jpg', src: 'audio/monster.mp3' },
    { title: 'Manusia Bodoh', artist: 'Ada Band', art: 'images/manusia_bodoh.png', src: 'audio/manusia_bodoh.mp3' },
    { title: 'Surga Cinta', artist: 'Ada Band', art: 'images/surga_cinta.png', src: 'audio/surga_cinta.mp3' },
    { title: 'Yang Terbaik Bagimu', artist: 'Ada Band', art: 'images/yang_terbaik_bagimu.png', src: 'audio/yang_terbaik_bagimu.mp3' },
    { title: 'Sebelum Cahaya', artist: 'Letto', art: 'images/sebelum_cahaya.png', src: 'audio/sebelum_cahaya.mp3' },
    { title: 'Ruang Rindu', artist: 'Letto', art: 'images/ruang_rindu.png', src: 'audio/ruang_rindu.mp3' },
    { title: 'Semakin Ku Kejar Semakin Kau Jauh', artist: 'Five Minutes', art: 'images/semakin_ku_kejar_semakin_kau_jauh.png', src: 'audio/semakin_ku_kejar_semakin_kau_jauh.mp3' },
    { title: 'Galau', artist: 'Five Minutes', art: 'images/galau.png', src: 'audio/galau.mp3' },
    { title: 'Kehadiranmu', artist: 'Vagetoz', art: 'images/kehadiranmu.png', src: 'audio/kehadiranmu.mp3' },
    { title: 'Main Hati', artist: 'Andra And The BackBone', art: 'images/main_hati.png', src: 'audio/main_hati.mp3' },
    { title: 'Masih Ada', artist: 'Ello', art: 'images/masih_ada.png', src: 'audio/masih_ada.mp3' }
  ];

  const canvas = document.getElementById('visualizer');
  const ctx = canvas.getContext('2d');
  const albumArt = document.getElementById('albumArt');
  const titleEl = document.getElementById('trackTitle');
  const artistEl = document.getElementById('trackArtist');
  const playlist = document.getElementById('playlist');

  let currentIndex = 0;
  let audio = new Audio();
  let sourceNode = null;
  let rotation = 0;

  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const analyser = audioContext.createAnalyser();
  analyser.fftSize = 256;

  function loadTrack(index) {
    if (sourceNode) sourceNode.disconnect();
    if (!audio.paused) audio.pause();

    currentIndex = index;
    audio.src = trackData[index].src;
    audio.load();
    sourceNode = audioContext.createMediaElementSource(audio);
    sourceNode.connect(analyser);
    analyser.connect(audioContext.destination);

    albumArt.src = trackData[index].art;
    albumArt.style.display = 'block';
    titleEl.textContent = trackData[index].title;
    artistEl.textContent = trackData[index].artist;

    updatePlaylist();
    audioContext.resume();

    if (audio.paused) {
      albumArt.classList.remove('playing');
      albumArt.style.transform = `translate(-50%, -50%) rotate(${rotation}deg)`;
    } else {
      albumArt.classList.add('playing');
    }

    audio.play();
  }

  function updatePlaylist() {
    playlist.innerHTML = '';
    trackData.forEach((track, i) => {
      const div = document.createElement('div');
      let icon = '';
      if (i === currentIndex) {
        icon = audio.paused ? '▶︎' : '⏸';
        div.classList.add('active');
      }
      div.innerHTML = `${icon} ${track.title} - ${track.artist}`;

      div.addEventListener('click', () => {
        if (i === currentIndex) {
          if (audio.paused) {
            audio.play();
          } else {
            audio.pause();
          }
          updatePlaylist();
        } else {
          loadTrack(i);
        }
      });

      playlist.appendChild(div);
    });
  }

  function drawVisualizer() {
    requestAnimationFrame(drawVisualizer);
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const barWidth = (canvas.width / bufferLength) * 1.5;
    const radius = barWidth / 2;
    const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--accent-color');

    let x = 0;
    for (let i = 0; i < bufferLength; i++) {
      const barHeight = dataArray[i] / 2;
      ctx.fillStyle = accentColor;
      ctx.beginPath();
      ctx.moveTo(x + radius, canvas.height - barHeight);
      ctx.arc(x + radius, canvas.height - barHeight - radius, radius, Math.PI, 2 * Math.PI);
      ctx.lineTo(x + barWidth, canvas.height);
      ctx.lineTo(x, canvas.height);
      ctx.closePath();
      ctx.fill();
      x += barWidth + 1;
    }
  }

  audio.addEventListener('ended', () => {
    currentIndex = (currentIndex + 1) % trackData.length;
    loadTrack(currentIndex);
  });

  audio.addEventListener('play', () => {
    albumArt.classList.add('playing');
    updatePlaylist();
  });

  audio.addEventListener('pause', () => {
    albumArt.classList.remove('playing');
    rotation = (rotation + 0) % 360;
    albumArt.style.transform = `translate(-50%, -50%) rotate(${rotation}deg)`;
    updatePlaylist();
  });

  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  loadTrack(currentIndex);
  drawVisualizer();
});

