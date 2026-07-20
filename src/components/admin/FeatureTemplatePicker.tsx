'use client';

interface Props {
  suggestedFeatures: string[];
  selectedFeatures: string[];
  onToggleFeature: (feature: string) => void;
  onAddCustom: (feature: string) => void;
}

export default function FeatureTemplatePicker({
  suggestedFeatures,
  selectedFeatures,
  onToggleFeature,
  onAddCustom,
}: Props) {
  const alreadySelected = suggestedFeatures.filter(f => selectedFeatures.includes(f));
  const notSelected = suggestedFeatures.filter(f => !selectedFeatures.includes(f));

  return (
    <div>
      {/* Suggested features */}
      {suggestedFeatures.length > 0 && (
        <div className="mb-2">
          <p className="mb-1.5 text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
            Suggested features — click to add:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {notSelected.map((feature) => (
              <button
                key={feature}
                type="button"
                onClick={() => onToggleFeature(feature)}
                className="rounded-full border px-2.5 py-1 text-xs transition-colors hover:border-accent"
                style={{
                  backgroundColor: 'var(--bg-primary)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-secondary)',
                }}
              >
                + {feature}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Already selected from suggestions */}
      {alreadySelected.length > 0 && (
        <div className="mb-2">
          <p className="mb-1.5 text-xs font-medium" style={{ color: 'var(--accent)' }}>
            Added from suggestions:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {alreadySelected.map((feature) => (
              <button
                key={feature}
                type="button"
                onClick={() => onToggleFeature(feature)}
                className="rounded-full px-2.5 py-1 text-xs transition-colors"
                style={{
                  backgroundColor: 'var(--accent-light)',
                  color: 'var(--accent)',
                  border: '1px solid var(--accent)',
                }}
              >
                ✓ {feature}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Custom feature input */}
      <div className="flex gap-1.5">
        <input
          id="custom-feature-input"
          type="text"
          placeholder="Add custom feature..."
          className="flex-1 rounded-lg border px-2.5 py-1.5 text-xs focus:outline-none"
          style={{
            backgroundColor: 'var(--bg-primary)',
            borderColor: 'var(--border)',
            color: 'var(--text-primary)',
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              const input = e.currentTarget;
              const val = input.value.trim();
              if (val && !selectedFeatures.includes(val)) {
                onAddCustom(val);
                input.value = '';
              }
            }
          }}
        />
        <button
          type="button"
          onClick={() => {
            const input = document.getElementById('custom-feature-input') as HTMLInputElement;
            const val = input?.value?.trim();
            if (val && !selectedFeatures.includes(val)) {
              onAddCustom(val);
              input.value = '';
            }
          }}
          className="rounded-lg px-3 py-1.5 text-xs font-medium text-white"
          style={{ background: 'linear-gradient(135deg, var(--accent), #d946ef)' }}
        >
          Add
        </button>
      </div>
    </div>
  );
}
