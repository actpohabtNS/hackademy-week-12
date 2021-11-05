import dynamic from 'next/dynamic'

const Dapp = dynamic(
  () => import("../components/Dapp"),
  { ssr: false }
)

export default function Home() {
  return (
    <Dapp />
  )
}
