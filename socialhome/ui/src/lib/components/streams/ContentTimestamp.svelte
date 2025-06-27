<script lang="ts">
  export let content: any;
  export let now: Date = new Date();

  let timestampText = '';

  const min = 60;
  const hr = min * 60;
  const day = hr * 24;
  const month = day * 30;
  const year = day * 365;

  const rtf = new Intl.RelativeTimeFormat(navigator.language);

  $: {
    const rawTimeDiff = Math.round(now.getTime() / 1000 - parseInt(content.timestamp_epoch, 10));
    let timeDiff = 0;
    let period = 'second';

    if (rawTimeDiff < min) {
      timeDiff = rawTimeDiff;
    } else if (rawTimeDiff < hr) {
      period = 'minute';
      timeDiff = Math.round(rawTimeDiff / min);
    } else if (rawTimeDiff < day) {
      period = 'hour';
      timeDiff = Math.round(rawTimeDiff / hr);
    } else if (rawTimeDiff < month) {
      period = 'day';
      timeDiff = Math.round(rawTimeDiff / day);
    } else if (rawTimeDiff < year) {
      period = 'month';
      timeDiff = Math.round(rawTimeDiff / month);
    } else {
      period = 'year';
      timeDiff = Math.round(rawTimeDiff / year);
    }

    const humanizedTimestamp = rtf.format(-timeDiff, period);
    timestampText = content.edited ? `${humanizedTimestamp} (edited)` : humanizedTimestamp;
  }
</script>

<div class="text-gray-400 text-sm">
  <a href={content.url} title={content.timestamp} class="hover:underline">
    {timestampText}
  </a>
  {#if content.visibility === 'limited'}
    <i class="fa fa-lock ml-1" aria-hidden="true"></i>
  {/if}
</div>
