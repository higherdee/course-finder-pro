# Architecture decisions

- Keep the public Syllaboss discovery experience client-side and dataset-backed until accounts or saved profiles are requested, because search does not require persistence.
- Store the normalized institution and course directories as static JSON imported by the search UI, because this keeps the selector immediate and usable without an external service.
