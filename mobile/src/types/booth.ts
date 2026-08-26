export interface TemplateSlot {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
}

export interface PhotoTemplate {
  id: string;
  name: string;
  description: string;
  backgroundColors: readonly [string, string];
  frameColor: string;
  captionBackground: string;
  captionColor: string;
  slots: TemplateSlot[];
}

export interface CapturedShot {
  id: string;
  uri: string;
}

export interface BoothDraft {
  templateId: string;
  finalUri: string;
  createdAt: string;
}
