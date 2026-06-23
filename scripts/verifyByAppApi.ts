async function main() {
  const base = 'http://localhost:8787/api/calendar';
  const byApp = await fetch(`${base}/events/by-app/qapi_meeting-20260609-10`);
  const body = await byApp.json();
  console.log('by-app HTTP', byApp.status);
  console.log('completion', body._completion);
  console.log('hub completionPercent', body._hub?.completionPercent);
  console.log('googleEventId', body.googleEventId);
  console.log('description has Completion:', body.description?.includes('Completion:'));

  const evidence = await fetch(`${base}/events/qapi_meeting-20260609-10/evidence`);
  const evBody = await evidence.json();
  console.log('evidence HTTP', evidence.status, 'count', evBody.count);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});