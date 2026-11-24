import cv2,sys,subprocess,numpy as np
src=sys.argv[1]
W,H=480,270
p=subprocess.Popen(['ffmpeg','-v','error','-i',src,'-vf',f'fps=1,scale={W}:{H}','-f','rawvideo','-pix_fmt','bgr24','-'],stdout=subprocess.PIPE)
cc=cv2.CascadeClassifier(cv2.data.haarcascades+'haarcascade_frontalface_default.xml')
t=0;hits=[]
while True:
  b=p.stdout.read(W*H*3)
  if len(b)<W*H*3: break
  f=np.frombuffer(b,np.uint8).reshape(H,W,3)
  g=cv2.cvtColor(f,cv2.COLOR_BGR2GRAY)
  fs=cc.detectMultiScale(g,1.1,6,minSize=(18,18))
  if len(fs): hits.append((t,[tuple(int(v) for v in x) for x in fs]))
  t+=1
for h in hits: print(h)
