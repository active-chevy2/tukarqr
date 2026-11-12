const CARD_LABEL_FONT_SIZE = 44;
const MIN_FONT_SIZE = 32;
/** Average advance of semibold system-ui, as a fraction of font size. */
const CHAR_RATIO = 0.5;

export interface PlacedCardLine {
  text: string;
  y: number;
  fontSize: number;
}

export interface PlacedCardLabels {
  /** Vertical space reserved under the QR, before the magenta bar. */
  area: number;
  lines: PlacedCardLine[];
}

export function cardLabelMaxWidth(innerWidth: number): number {
  return Math.max(120, innerWidth - 48);
}

function lineHeight(fontSize: number): number {
  return Math.round(fontSize * 1.2);
}

function wrapWords(text: string, maxChars: number): string[] {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length <= maxChars) {
      current = next;
      continue;
    }
    if (current) lines.push(current);
    current = word.length > maxChars ? word.slice(0, maxChars) : word;
  }
  if (current) lines.push(current);
  return lines;
}

function layoutLabel(
  text: string,
  maxWidth: number,
): { lines: string[]; fontSize: number } {
  let fontSize = CARD_LABEL_FONT_SIZE;
  while (fontSize >= MIN_FONT_SIZE) {
    const maxChars = Math.max(8, Math.floor(maxWidth / (fontSize * CHAR_RATIO)));
    const lines = wrapWords(text, maxChars);
    if (lines.length <= 2) return { lines, fontSize };
    fontSize -= 2;
  }
  const maxChars = Math.max(
    8,
    Math.floor(maxWidth / (MIN_FONT_SIZE * CHAR_RATIO)),
  );
  const lines = wrapWords(text, maxChars);
  return {
    lines: lines.length <= 2 ? lines : [lines[0]!, lines.slice(1).join(" ")],
    fontSize: MIN_FONT_SIZE,
  };
}

/**
 * Stacks merchant and bank names under the QR.
 * A name that fits stays on one line. A longer name wraps to a second line
 * and the reserved area grows so the line stays above the magenta bar.
 */
export function placeCardLabels(
  merchantName: string | null,
  bankName: string | null,
  maxWidth: number,
): PlacedCardLabels {
  const merchant = merchantName?.trim()
    ? layoutLabel(merchantName, maxWidth)
    : null;
  const bank = bankName?.trim() ? layoutLabel(bankName, maxWidth) : null;
  if (!merchant && !bank) return { area: 0, lines: [] };

  const singleLine = (label: { lines: string[]; fontSize: number } | null) =>
    !label || (label.lines.length === 1 && label.fontSize === CARD_LABEL_FONT_SIZE);

  if (merchant && bank && singleLine(merchant) && singleLine(bank)) {
    return {
      area: 110,
      lines: [
        { text: merchant.lines[0]!, y: 22, fontSize: CARD_LABEL_FONT_SIZE },
        { text: bank.lines[0]!, y: 78, fontSize: CARD_LABEL_FONT_SIZE },
      ],
    };
  }

  if ((merchant && !bank) || (!merchant && bank)) {
    const only = (merchant ?? bank)!;
    if (singleLine(only)) {
      return {
        area: 80,
        lines: [
          { text: only.lines[0]!, y: 40, fontSize: CARD_LABEL_FONT_SIZE },
        ],
      };
    }
  }

  const placed: PlacedCardLine[] = [];
  let cursor = 22;
  for (const label of [merchant, bank]) {
    if (!label) continue;
    if (placed.length > 0) cursor += 8;
    const step = lineHeight(label.fontSize);
    label.lines.forEach((text, index) => {
      placed.push({
        text,
        y: cursor + index * step,
        fontSize: label.fontSize,
      });
    });
    cursor += label.lines.length * step;
  }

  const last = placed[placed.length - 1]!;
  return { area: last.y + 32, lines: placed };
}
