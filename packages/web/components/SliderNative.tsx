import { useRef, useState, useMemo, useCallback, useEffect } from 'react'
import { css, cx } from '@emotion/css'

const style = css`
  -webkit-appearance: none;
  background: transparent;
  border-radius: 9999px;
  width: 100%;

  &::-webkit-slider-runnable-track {
    border-radius: 9999px;
    height: 2px;
    width: 100%;
    background-color: hsla(215 28% 17% / 0.1);
  }
  &::-moz-range-track {
    border-radius: 9999px;
    height: 8px;
    width: 100%;
    background-color: hsla(215 28% 17% / 0.1);
  }
  &::-webkit-slider-thumb {
    background-color: hsl(var(--brand-color-500));
    border-radius: 9999px;
    height: 16px;
    width: 16px;
    border: none;
    -webkit-appearance: none;
    top: 50%;
    color: hsl(215 28% 17%);
    transform: translateY(-50%);
  }
  &::-moz-range-thumb {
    background-color: hsl(0 0% 100%);
    border-radius: 9999px;
    height: 16px;
    width: 16%;
    border: none;
    top: 50%;
    color: hsl(215 28% 17%);
  }
`

const Slider = ({
  value,
  min,
  max,
  onChange,
  onlyCallOnChangeAfterDragEnded = false,
  orientation = 'horizontal',
  alwaysShowTrack = false,
  alwaysShowThumb = false,
  step = 0.0001,
}: {
  value: number
  min: number
  max: number
  onChange: (value: number) => void
  onlyCallOnChangeAfterDragEnded?: boolean
  orientation?: 'horizontal' | 'vertical'
  alwaysShowTrack?: boolean
  alwaysShowThumb?: boolean
  step?: number
}) => {
  return (
    <input
      type='range'
      min={min}
      max={max}
      value={value}
      step={step}
      onChange={e => onChange(Number(e.target.value))}
      className={style}
    />
  )
}

export default Slider
