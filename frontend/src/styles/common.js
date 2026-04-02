export const tableStyles = {
  tableWrapper: { background: 'white', borderRadius: '8px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', overflow: 'hidden' },
  table:        { width: '100%', borderCollapse: 'collapse' },
  th:           { padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.85rem', color: '#555', borderBottom: '1px solid #eee', backgroundColor: '#fafafa' },
  tr:           { borderBottom: '1px solid #f0f0f0' },
  td:           { padding: '0.75rem 1rem', fontSize: '0.95rem', color: '#333' },
  empty:        { padding: '2rem', textAlign: 'center', color: '#888' },
};

export const formStyles = {
  formCard:    { background: 'white', padding: '1.5rem', borderRadius: '8px', marginBottom: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' },
  formTitle:   { margin: '0 0 1rem 0', fontSize: '1rem', color: '#1a1a2e' },
  formGrid:    { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' },
  field:       { display: 'flex', flexDirection: 'column', gap: '0.25rem' },
  label:       { fontSize: '0.85rem', color: '#555' },
  input:       { padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px', fontSize: '0.95rem' },
  select:      { padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px', fontSize: '0.95rem', backgroundColor: 'white' },
  textarea:    { padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px', fontSize: '0.95rem', resize: 'vertical' },
  formActions: { display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' },
};

export const buttonStyles = {
  btnPrimary:   { background: '#1a1a2e', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9rem' },
  btnSecondary: { background: 'white', color: '#333', border: '1px solid #ddd', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9rem' },
  btnEdit:      { background: '#e3f2fd', color: '#1565c0', border: 'none', padding: '0.3rem 0.7rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem', marginRight: '0.5rem' },
  btnDelete:    { background: '#fce4ec', color: '#c62828', border: 'none', padding: '0.3rem 0.7rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' },
  btnActivate:  { background: '#e8f5e9', color: '#2e7d32', border: 'none', padding: '0.3rem 0.7rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' },
};

export const badgeStyles = {
  badgeActive:   { background: '#e8f5e9', color: '#2e7d32', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.8rem' },
  badgeInactive: { background: '#fce4ec', color: '#c62828', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.8rem' },
};

export const pageStyles = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
  title:  { margin: 0, fontSize: '1.5rem', color: '#1a1a2e' },
  error:  { color: '#d32f2f', marginBottom: '1rem' },
};