import { parseTaskCsv } from './csv.js';

function storageFailureMessage(result) {
  const detail = result?.error ? ` ${result.error}` : '';
  return `Browser storage could not save the imported records.${detail}`;
}

/**
 * Parses, validates, confirms, and persists an import without mutating the caller's state.
 * The caller applies nextState only when status is "imported".
 */
export function importCsvTransaction({ csvText, currentState, confirmReplace, persist }) {
  let parsed;
  try {
    parsed = parseTaskCsv(csvText);
  } catch (error) {
    return {
      status: 'invalid',
      errors: [`CSV could not be read: ${error.message}`],
    };
  }

  if (!parsed.valid) {
    return { status: 'invalid', errors: parsed.errors };
  }

  const importedCount = parsed.tasks.length;
  let confirmed;
  try {
    confirmed = confirmReplace({
      currentCount: currentState.tasks.length,
      importedCount,
    });
  } catch (error) {
    return {
      status: 'confirmation-error',
      error: `Import confirmation could not be completed: ${error.message}`,
    };
  }

  if (!confirmed) return { status: 'cancelled' };

  const nextState = {
    tasks: parsed.tasks,
    reportingDate: currentState.reportingDate,
  };
  let storageResult;
  try {
    storageResult = persist(nextState);
  } catch (error) {
    return {
      status: 'storage-error',
      error: `Browser storage could not save the imported records. ${error.message}`,
    };
  }
  if (!storageResult?.available) {
    return { status: 'storage-error', error: storageFailureMessage(storageResult) };
  }

  return { status: 'imported', nextState, importedCount };
}
