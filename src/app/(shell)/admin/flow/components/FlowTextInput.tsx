"use client";

import { Sparkles, Languages, ArrowRightLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TextArea } from "@/components/ui/input";
import { convertCnToTw, convertTwToCn } from "@/lib/chinese-converter";

interface FlowTextInputProps {
  textEn: string;
  textZhCn: string;
  textZhTw: string;
  onChangeTextEn: (text: string) => void;
  onChangeTextZhCn: (text: string) => void;
  onChangeTextZhTw: (text: string) => void;
  disabled?: boolean;
}

const SAMPLE_SCRIPTS = {
  en: `Deep in the heart of the Pacific Ocean lies an uncharted volcanic island shrouded in perpetual mist. For centuries, ancient maritime explorers whispered legends of its luminescent flora and untouched wildlife. Yesterday morning, an autonomous research submarine detected unusual thermal energy plumes along the northern coral ridge. Scientists immediately dispatched high-resolution robotic probes to survey the seafloor caverns. What they unveiled was breathtaking: subterranean hydrothermal vents illuminating crystalline crystal formations never seen before. Schools of bioluminescent cephalopods danced gracefully around the mineral chimneys in rhythmic harmony. As the expedition team mapped the underwater topography, every sensor registered unprecedented biological biodiversity. Marine biologists believe these pristine hydrothermal ecosystems could unlock secrets about the origins of life on Earth. Future exploratory missions will preserve this fragile aquatic sanctuary while studying its extraordinary geothermal dynamics. The ocean continues to hold mysteries far beyond the boundaries of human imagination.`,
  zhCn: `在太平洋深处的隐秘海域中，坐落着一座终年被神秘浓雾所笼罩的无人火山岛。几个世纪以来，古代航海探险者之间流传着关于这座岛屿发光奇特植物与原始秘境的传说。昨日清晨，一艘自主深海科考潜水器在岛屿北侧的珊瑚海脊深处探测到了异常的地热能量羽流。科研团队随即部署了先进的高清深海机器人，对漆黑的海底岩洞展开了全面探测。呈现在科学家眼前的是一幅令人窒息的壮阔奇景：地底热液喷口照亮了晶莹剔透的水晶矿脉，光华流转。成群具有生物自发光特性的乌贼在矿物烟囱周围翩翩起舞，姿态优美而神秘。随着科考队绘制出完整的海底地形图谱，各项传感器均记录到了前所未有的丰富生物多样性。海洋生物学家深信，这些纯净的深海热液生态系统蕴含着解开地球生命起源奥秘的关键线索。未来的科学考察将在严格保护这片脆弱水下庇护所的同时，深入探究其独特的地球物理动态。广袤的海洋依然深藏着远超人类想象力的无尽神秘。`,
  zhTw: `在太平洋深處的隱秘海域中，坐落著一座終年被神秘濃霧所籠罩的無人火山島。幾個世紀以來，古代航海探險者之間流傳著關於這座島嶼發光奇特植物與原始秘境的傳說。昨日清晨，一艘自主深海科考潛水器在島嶼北側的珊瑚海脊深處探測到了異常的地熱能量羽流。科研團隊隨即部署了先進的高清深海機器人，對漆黑的海底岩洞展開了全面探測。呈現在科學家眼前的是一幅令人窒息的壯闊奇景：地底熱液噴口照亮了晶瑩剔透的水晶礦脈，光華流轉。成群具有生物自發光特性的烏賊在礦物煙囪周圍翩翩起舞，姿態優美而神秘。隨著科考隊繪製出完整的海底地形圖譜，各項感測器均記錄到了前所未有的豐富生物多樣性。海洋生物學家深信，這些純淨的深海熱液生態系統蘊含著解開地球生命起源奧秘的關鍵線索。未來的科學考察將在嚴格保護這片脆弱水下庇護所的同時，深入探究其獨特的地球物理動態。廣袤的海洋依然深藏著遠超人類想像力的無盡神秘。`,
};

export function FlowTextInput({
  textEn,
  textZhCn,
  textZhTw,
  onChangeTextEn,
  onChangeTextZhCn,
  onChangeTextZhTw,
  disabled = false,
}: FlowTextInputProps) {
  const handleLoadSamples = () => {
    onChangeTextEn(SAMPLE_SCRIPTS.en);
    onChangeTextZhCn(SAMPLE_SCRIPTS.zhCn);
    onChangeTextZhTw(SAMPLE_SCRIPTS.zhTw);
  };

  const handleTranslateZh = () => {
    if (textZhCn.trim() && !textZhTw.trim()) {
      onChangeTextZhTw(convertCnToTw(textZhCn.trim()));
    } else if (textZhTw.trim() && !textZhCn.trim()) {
      onChangeTextZhCn(convertTwToCn(textZhTw.trim()));
    } else if (textZhCn.trim() && textZhTw.trim()) {
      // If both present, update TW from CN
      onChangeTextZhTw(convertCnToTw(textZhCn.trim()));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Languages className="h-5 w-5 text-accent-primary" />
          <h3 className="text-body font-semibold text-text-primary">
            3-Locale Narration Scripts (≈10 Sentences)
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {(textZhCn.trim() || textZhTw.trim()) && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleTranslateZh}
              disabled={disabled}
              className="text-caption text-accent-primary"
              title="Translate between Simplified (zh-CN) and Traditional (zh-TW)"
            >
              <ArrowRightLeft className="mr-1.5 h-3.5 w-3.5" />
              Sync zh-CN ↔ zh-TW
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleLoadSamples}
            disabled={disabled}
            className="text-caption text-accent-primary hover:text-accent-secondary"
          >
            <Sparkles className="mr-1.5 h-3.5 w-3.5" />
            Load Sample Scripts
          </Button>
        </div>
      </div>

      <p className="text-caption text-text-muted">
        English and at least one Chinese version are mandatory. If one Chinese version is left empty, it will be auto-translated using OpenCC upon submission.
      </p>

      <div className="space-y-4">
        {/* English Script */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-caption font-medium text-text-primary">
              English Script (en) <span className="text-red-500">*</span>
            </span>
            <span className="text-micro text-text-muted">
              {textEn.length} characters
            </span>
          </div>
          <TextArea
            value={textEn}
            onChange={(e) => onChangeTextEn(e.target.value)}
            placeholder="Enter English narration text (approx. 10 sentences for 10 clips)..."
            rows={4}
            disabled={disabled}
            className="font-sans text-body"
          />
        </div>

        {/* Simplified Chinese Script */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-caption font-medium text-text-primary">
              Simplified Chinese (zh-CN)
            </span>
            <span className="text-micro text-text-muted">
              {textZhCn.length} characters
            </span>
          </div>
          <TextArea
            value={textZhCn}
            onChange={(e) => onChangeTextZhCn(e.target.value)}
            placeholder="输入简体中文旁白内容（约10句话，可由繁体自动翻译）..."
            rows={4}
            disabled={disabled}
            className="font-sans text-body"
          />
        </div>

        {/* Traditional Chinese Script */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-caption font-medium text-text-primary">
              Traditional Chinese (zh-TW)
            </span>
            <span className="text-micro text-text-muted">
              {textZhTw.length} characters
            </span>
          </div>
          <TextArea
            value={textZhTw}
            onChange={(e) => onChangeTextZhTw(e.target.value)}
            placeholder="輸入繁體中文旁白內容（約10句話，可由簡體自動翻譯）..."
            rows={4}
            disabled={disabled}
            className="font-sans text-body"
          />
        </div>
      </div>
    </div>
  );
}
