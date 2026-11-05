import { useRef, useState } from 'react';
import { DOMAINS } from '../services/constants.js';

const emptyForm = {
  title: '',
  abstract: '',
  domain: DOMAINS[0],
  publicationYear: new Date().getFullYear(),
  journal: '',
  doiOrUrl: '',
  keywords: '',
  status: 'Draft',
};

// Used by both Add and Edit pages. `initial` is the existing record when editing.
function ResearchForm({ initial, onSubmit, submitLabel }) {
  const [form, setForm] = useState(
    initial ? { ...emptyForm, ...initial, keywords: (initial.keywords || []).join(', ') } : emptyForm
  );
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const titleRef = useRef(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Basic client-side validation (the server validates again)
    const year = Number(form.publicationYear);
    if (!form.title.trim() || !form.abstract.trim() || !form.journal.trim()) {
      setError('Title, abstract and journal/conference are required.');
      titleRef.current.focus();
      return;
    }
    if (!Number.isInteger(year) || year < 1900 || year > new Date().getFullYear() + 1) {
      setError('Enter a valid publication year.');
      return;
    }

    setSaving(true);
    try {
      await onSubmit({
        title: form.title,
        abstract: form.abstract,
        domain: form.domain,
        publicationYear: year,
        journal: form.journal,
        doiOrUrl: form.doiOrUrl,
        keywords: form.keywords.split(',').map((k) => k.trim()).filter(Boolean),
        status: form.status,
      });
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  return (
    <form className="form" onSubmit={handleSubmit}>
      {error && <p className="alert alert-error">{error}</p>}

      <label>Title *
        <input ref={titleRef} name="title" value={form.title} onChange={handleChange} maxLength={200} />
      </label>

      <label>Abstract *
        <textarea name="abstract" rows="6" value={form.abstract} onChange={handleChange} maxLength={3000} />
      </label>

      <div className="row">
        <label>Domain *
          <select name="domain" value={form.domain} onChange={handleChange}>
            {DOMAINS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </label>
        <label>Publication year *
          <input type="number" name="publicationYear" value={form.publicationYear} onChange={handleChange} />
        </label>
      </div>

      <label>Journal / Conference *
        <input name="journal" value={form.journal} onChange={handleChange} maxLength={200} />
      </label>

      <label>DOI or URL (optional)
        <input name="doiOrUrl" value={form.doiOrUrl} onChange={handleChange} placeholder="10.1000/xyz123 or https://..." />
      </label>

      <label>Keywords (comma separated)
        <input name="keywords" value={form.keywords} onChange={handleChange} placeholder="machine learning, data mining" />
      </label>

      <label>Status
        <select name="status" value={form.status} onChange={handleChange}>
          <option value="Draft">Draft (private)</option>
          <option value="Published">Published (public)</option>
        </select>
      </label>

      <button className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : submitLabel}</button>
    </form>
  );
}

export default ResearchForm;
