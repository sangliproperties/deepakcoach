import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
export default async function WatchPage({params}:{params:{slug:string}}){
 const user=await requireUser(undefined,`/paid-sessions/${params.slug}`);
 const item=await prisma.recordedVideo.findUnique({where:{slug:params.slug}});if(!item)notFound();
 const owned=user.role==="ADMIN"||!!(await prisma.recordedPurchase.findFirst({where:{userId:user.id,videoId:item.id,status:"PAID"}}));
 if(!owned)return <div className="mx-auto max-w-4xl px-5 py-16"><h1 className="font-display text-4xl">Purchase required</h1><p className="mt-4">Get this recording from the Paid Sessions catalog.</p><Link href="/paid-sessions" className="button-primary mt-5 inline-flex">Browse Paid Sessions</Link></div>;
 return <div className="mx-auto max-w-5xl px-5 py-16"><h1 className="font-display text-4xl">{item.title}</h1><p className="mt-3 text-ink/65">{item.durationMins} minutes</p><video controls controlsList="nodownload" preload="metadata" poster={`/api/recorded-sessions/${item.id}/thumbnail`} src={`/api/recorded-sessions/${item.id}/stream`} className="mt-8 aspect-video w-full rounded-2xl bg-black"/><p className="mt-6 leading-7">{item.description}</p></div>
}
