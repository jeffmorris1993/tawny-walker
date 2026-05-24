// Shared shimmer bar used inside admin table skeleton rows. The column
// templates differ between Leads and Listings, so each page still owns its
// own skeleton-row shape — this just supplies the inner placeholder pill so
// the gradient + animation hook (`tw-skel-bar`) live in one place.
//
// Props:
//   width   number | string (px or % accepted, forwarded to inline style)
//   height  number | string
const SHIMMER = 'linear-gradient(90deg, #ECE6D8 0%, #F4EFE2 50%, #ECE6D8 100%)';

export default function ShimmerBar({ width, height }) {
  return (
    <span className="tw-skel-bar" style={{
      display: 'inline-block',
      width, height,
      background: SHIMMER, backgroundSize: '200% 100%',
    }} />
  );
}
