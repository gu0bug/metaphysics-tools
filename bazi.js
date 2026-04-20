/**
 * bazi.js — 算八字核心逻辑
 * 依赖：lunar-javascript (全局 Lunar 对象)
 */
(function () {
    'use strict';

    /* ─────────────── 工具函数 ─────────────── */
    const pad = (n) => String(n).padStart(2, '0');

    const CURRENT_YEAR = new Date().getFullYear();

    /* ─────────────── 状态 ─────────────── */
    let targetDate = new Date(2000, 0, 1);
    let viewDate   = new Date(2000, 0, 1);

    /* ─────────────── DOM 引用 ─────────────── */
    const calculateBtn   = document.getElementById('calculate-btn');
    const resetBtn       = document.getElementById('reset-btn');
    const inputView      = document.getElementById('input-view');
    const resultView     = document.getElementById('result-view');
    const dateTrigger    = document.getElementById('date-trigger');
    const selectedDateTxt= document.getElementById('selected-date-text');
    const overlay        = document.getElementById('date-picker-overlay');
    const sheet          = document.getElementById('date-picker-sheet');
    const closeOverlay   = document.getElementById('close-overlay');
    const confirmDateBtn = document.getElementById('confirm-date-btn');
    const prevMonthBtn   = document.getElementById('prev-month');
    const nextMonthBtn   = document.getElementById('next-month');
    const yearSelect     = document.getElementById('select-year');
    const monthSelect    = document.getElementById('select-month');
    const displayYear    = document.getElementById('display-year');
    const displayMonth   = document.getElementById('display-month');
    const calendarGrid   = document.getElementById('calendar-grid');
    const timeSelect     = document.getElementById('time-select');
    const dayunContainer = document.getElementById('dayun-container');
    const liuNianGrid    = document.getElementById('liunian-grid');

    /* ─────────────── 初始化年份/月份下拉 ─────────────── */
    function initSelects() {
        for (let y = 1900; y <= CURRENT_YEAR + 5; y++) {
            const opt = document.createElement('option');
            opt.value = y;
            opt.text  = y + ' 年';
            opt.style.backgroundColor = 'var(--bg-surface)';
            opt.style.color           = 'var(--text-main)';
            yearSelect.appendChild(opt);
        }
        for (let m = 0; m < 12; m++) {
            const opt = document.createElement('option');
            opt.value = m;
            opt.text  = pad(m + 1) + ' 月';
            opt.style.backgroundColor = 'var(--bg-surface)';
            opt.style.color           = 'var(--text-main)';
            monthSelect.appendChild(opt);
        }
        yearSelect.value  = targetDate.getFullYear();
        monthSelect.value = targetDate.getMonth();
        selectedDateTxt.innerText = formatDateText(targetDate);
    }

    function formatDateText(d) {
        return `${d.getFullYear()} 年 ${pad(d.getMonth() + 1)} 月 ${pad(d.getDate())} 日`;
    }

    /* ─────────────── 日历渲染 ─────────────── */
    function renderCalendar() {
        const year  = viewDate.getFullYear();
        const month = viewDate.getMonth();

        yearSelect.value    = year;
        monthSelect.value   = month;
        displayYear.innerText  = year;
        displayMonth.innerText = pad(month + 1);

        const firstDay      = new Date(year, month, 1).getDay();
        const daysInMonth   = new Date(year, month + 1, 0).getDate();
        const prevMonthDays = new Date(year, month, 0).getDate();

        calendarGrid.innerHTML = '';
        let count = 0;

        for (let i = firstDay - 1; i >= 0; i--) {
            calendarGrid.appendChild(createCell(year, month - 1, prevMonthDays - i, 'other'));
            count++;
        }
        for (let i = 1; i <= daysInMonth; i++) {
            const isSel = targetDate.getFullYear() === year
                       && targetDate.getMonth()    === month
                       && targetDate.getDate()     === i;
            calendarGrid.appendChild(createCell(year, month, i, isSel ? 'selected' : 'current'));
            count++;
        }
        let nextDay = 1;
        while (count < 42) {
            calendarGrid.appendChild(createCell(year, month + 1, nextDay++, 'other'));
            count++;
        }
    }

    function createCell(y, m, d, state) {
        const cell = document.createElement('div');
        cell.className = 'aspect-square flex flex-col items-center justify-center rounded-lg cursor-pointer transition-colors hover:bg-gray-500/20 py-1';

        if (state === 'selected') {
            cell.classList.add('border');
            cell.style.cssText = 'border-color:var(--accent-gold);background-color:var(--state-selected);color:var(--accent-gold);';
        } else if (state === 'other') {
            cell.style.opacity = '0.3';
        }

        const solar = document.createElement('span');
        solar.className = 'text-[15px] leading-none mb-[2px] font-medium';
        solar.innerText = d;

        const lunar = document.createElement('span');
        lunar.className = 'text-tiny-lunar font-serif-sc opacity-80';
        try {
            const ld   = Lunar.fromDate(new Date(y, m, d));
            const term = ld.getJieQi();
            lunar.innerText = term ? term : ld.getDayInChinese();
        } catch (e) {
            lunar.innerText = '';
        }

        cell.appendChild(solar);
        cell.appendChild(lunar);
        cell.onclick = () => {
            targetDate = new Date(y, m, d);
            viewDate   = new Date(y, m, 1);
            renderCalendar();
        };
        return cell;
    }

    /* ─────────────── 日期选择器弹窗 ─────────────── */
    function openPicker() {
        viewDate = new Date(targetDate);
        overlay.classList.add('modal-enter');
        sheet.classList.add('sheet-enter');
        renderCalendar();
    }

    function closePicker() {
        overlay.classList.remove('modal-enter');
        sheet.classList.remove('sheet-enter');
    }

    dateTrigger.onclick   = openPicker;
    closeOverlay.onclick  = closePicker;
    confirmDateBtn.onclick = () => {
        selectedDateTxt.innerText = formatDateText(targetDate);
        closePicker();
    };
    prevMonthBtn.onclick = () => { viewDate.setMonth(viewDate.getMonth() - 1); renderCalendar(); };
    nextMonthBtn.onclick = () => { viewDate.setMonth(viewDate.getMonth() + 1); renderCalendar(); };
    yearSelect.addEventListener('change',  (e) => { viewDate.setFullYear(parseInt(e.target.value)); renderCalendar(); });
    monthSelect.addEventListener('change', (e) => { viewDate.setMonth(parseInt(e.target.value));    renderCalendar(); });

    /* ─────────────── 流年渲染 ─────────────── */
    function renderLiuNian(birthYear) {
        if (!liuNianGrid) return;
        liuNianGrid.innerHTML = '';
        const today     = new Date();
        const thisYear  = today.getFullYear();
        const startYear = thisYear - 2;
        const GAN  = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
        const ZHI  = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
        const base = 4; // 甲子年为 1984, 基准偏移

        for (let yr = startYear; yr <= startYear + 4; yr++) {
            const ganIdx = ((yr - 4) % 10 + 10) % 10;
            const zhiIdx = ((yr - 4) % 12 + 12) % 12;
            const ganzhi = GAN[ganIdx] + ZHI[zhiIdx];
            const isCurrent = yr === thisYear;

            const el = document.createElement('div');
            el.className = 'p-2 border rounded text-center text-sm font-serif-sc transition-colors';
            if (isCurrent) {
                el.style.cssText = 'border-color:var(--accent-gold);color:var(--accent-gold);background-color:var(--state-selected);';
            } else {
                el.style.cssText = 'border-color:rgba(128,128,128,0.3);opacity:0.8;';
            }
            el.innerHTML = `${yr}<br>${ganzhi}`;
            liuNianGrid.appendChild(el);
        }
    }

    /* ─────────────── 排盘计算 ─────────────── */
    calculateBtn.onclick = () => {
        const hour        = parseInt(timeSelect.value);
        const genderValue = parseInt(document.querySelector('input[name="gender"]:checked').value);
        const genderText  = genderValue === 1 ? '乾造' : '坤造';

        const birthTime = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), hour, 30);
        const lunar     = Lunar.fromDate(birthTime);
        const baZi      = lunar.getEightChar();
        baZi.setSect(2);

        // 基本信息
        document.getElementById('res-gregorian').innerText = `${birthTime.getFullYear()}-${pad(birthTime.getMonth()+1)}-${pad(birthTime.getDate())} ${pad(hour)}:00`;
        document.getElementById('res-lunar').innerText     = `${lunar.getYearInGanZhi()}年 ${lunar.getMonthInChinese()}月${lunar.getDayInChinese()} ${lunar.getTimeZhi()}时`;
        document.getElementById('res-gender').innerText    = genderText;

        // 四柱
        document.getElementById('stem-year').innerText   = baZi.getYearGan();
        document.getElementById('branch-year').innerText = baZi.getYearZhi();
        document.getElementById('stem-month').innerText   = baZi.getMonthGan();
        document.getElementById('branch-month').innerText = baZi.getMonthZhi();
        document.getElementById('stem-day').innerText     = baZi.getDayGan();
        document.getElementById('branch-day').innerText   = baZi.getDayZhi();
        document.getElementById('stem-time').innerText    = baZi.getTimeGan();
        document.getElementById('branch-time').innerText  = baZi.getTimeZhi();

        // 纳音
        const naYinEl = document.getElementById('res-nayin');
        if (naYinEl) {
            naYinEl.innerText = `${baZi.getYearNaYin()} · ${baZi.getMonthNaYin()} · ${baZi.getDayNaYin()} · ${baZi.getTimeNaYin()}`;
        }

        // 大运
        dayunContainer.innerHTML = '';
        const yun    = baZi.getYun(genderValue);
        const daYuns = yun.getDaYun();

        for (let i = 1; i < 9; i++) {
            if (i >= daYuns.length) break;
            const dy  = daYuns[i];
            const box = document.createElement('div');
            box.className = 'flex flex-col items-center justify-center p-3 rounded-lg border hover:bg-gray-500/10 transition-colors cursor-default';
            box.style.borderColor = 'var(--border-base)';
            box.style.minWidth    = '75px';
            box.innerHTML = `
                <span class="text-xs mb-2 opacity-60 font-mono">${dy.getStartYear()}</span>
                <span class="text-xl font-serif-sc tracking-widest">${dy.getGanZhi()}</span>
                <span class="text-xs mt-2 opacity-60">${dy.getStartAge()}岁</span>
            `;
            dayunContainer.appendChild(box);
        }

        // 流年
        renderLiuNian(targetDate.getFullYear());

        inputView.classList.add('hidden');
        resultView.classList.remove('hidden');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    resetBtn.onclick = () => {
        resultView.classList.add('hidden');
        inputView.classList.remove('hidden');
    };

    /* ─────────────── 启动 ─────────────── */
    initSelects();

})();
