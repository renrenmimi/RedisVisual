// RedisLab 品牌标记（BrandMark）。
// 「一枚钥匙串起两个内存格子」——寓意 Redis 的本质：key → value 的内存字典。
// 上方两个方块是内存里的键值格子，下方连线+圆点像一把钥匙，呼应
// 「看得见的 Redis / See Inside Redis」。
// 纯 SVG、用 currentColor 上色，故可随处复用（侧栏用白色，其它场景继承文字色）。

export function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      {/* 两个内存格子（key → value） */}
      <rect x="4" y="4" width="7" height="7" rx="1.6" fill="currentColor" opacity={0.55} />
      <rect x="13" y="4" width="7" height="7" rx="1.6" fill="currentColor" />
      {/* 钥匙杆 + 齿 */}
      <g stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" opacity={0.92}>
        <line x1="7.5" y1="13" x2="7.5" y2="19.5" />
        <line x1="7.5" y1="19.5" x2="11" y2="19.5" />
      </g>
      <circle cx="7.5" cy="13" r="1.4" fill="currentColor" />
    </svg>
  );
}
