import Image from "next/image";
import { ChevronsRight } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { getChainById, getTokenInfo } from "@/app/utils/tokens";
import { formatTime, fixDecimal, createJobId } from "@/app/logic/utils";
import { formatUnits } from "ethers";
import { cancelJob } from "@/app/logic/jobsAPI";

type Investment = {
    token: string;
    targetToken: string;
    vault: string;
    validAfter: number;
    validUntil: number;
    limitAmount: bigint;
    refreshInterval: bigint;
  };
  
  type JobExecution = {
    active: boolean;
    lastUsed: number;
    totalExecutions: number;
    totalTargetToken: bigint;
  };
  
type InvestmentCardProps = {
  investment: Investment;
  jobExecution: JobExecution;
  chainId: number;
  address: string;
};

export function InvestmentCard({ investment, jobExecution, chainId, address }: InvestmentCardProps) {
  return (
    <div
      className="border border-accent rounded-lg w-full flex flex-col gap-0 border-accent relative h-fit"
    >
      <div className="flex flex-col-reverse md:flex-row md:justify-between items-center px-4 py-3 border-b border-accent items-end md:items-center gap-2">
        <div className="flex flex-row items-center gap-3 w-full">
          <div className="flex flex-row justify-start items-center gap-2">
            <Image
              src={getTokenInfo(Number(chainId), investment.token)?.icon!}
              alt="From Token"
              width={30}
              height={30}
            />
            <div className="font-semibold">
              {getTokenInfo(Number(chainId), investment.token)?.name!}
            </div>
          </div>

          <div>
            <ChevronsRight />
          </div>

          <div className="flex flex-row justify-start items-center gap-2">
            <Image
              src={getTokenInfo(Number(chainId), investment.targetToken)?.icon!}
              alt="To Token"
              width={30}
              height={30}
            />
            <div className="font-semibold">
              {getTokenInfo(Number(chainId), investment.targetToken)?.name}
            </div>
          </div>
        </div>

        <div className="absolute -right-px -top-5">
          <Image
            className="bg-white rounded-full"
            src={getChainById(Number(chainId))?.icon!}
            alt="Chain Icon"
            width={30}
            height={30}
          />
        </div>
        <div>
          <Switch
            className="bg-accent rounded-full data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-accent border border-accent"
            onCheckedChange={async (checked) => {
              if (!checked) {
                const jobId = createJobId(
                  new Date(Number(investment.validAfter) * 1000),
                  new Date(Number(investment.validUntil) * 1000),
                  Number(investment.refreshInterval),
                  address,
                  chainId.toString()
                );
                await cancelJob(jobId);
              }
            }}
            defaultChecked={investment.validUntil > Math.floor(Date.now() / 1000)}
          />
        </div>
      </div>

      <div className="px-4 py-3 flex flex-col justify-start items-start">
        <div className="flex flex-col justify-between items-start gap-2 w-full">
          <div className="flex flex-row justify-between items-center w-full">
            <h4 className="font-semibold">Invests</h4>
            <div className="flex flex-row justify-start items-center gap-2">
              <Image
                src={getTokenInfo(Number(chainId), investment.token)?.icon!}
                alt="From Token"
                width={20}
                height={20}
              />
              <div className="font-semibold">
                {formatUnits(
                  investment.limitAmount,
                  getTokenInfo(Number(chainId), investment.token)?.decimals
                )}
              </div>
              <div className="font-semibold">
                {getTokenInfo(Number(chainId), investment.token)?.name}
              </div>
            </div>
          </div>
          <div className="flex flex-row justify-between items-center w-full">
            <h4 className="font-semibold">Every</h4>
            <h5>{formatTime(Number(investment.refreshInterval))}</h5>
          </div>
          <div className="flex flex-row justify-between items-center w-full">
            <h4 className="font-semibold">Expires On</h4>
            <h5>{`${new Date(Number(investment.validUntil) * 1000).toDateString()} ${new Date(
              Number(investment.validUntil) * 1000
            ).toLocaleTimeString()}`}</h5>
          </div>
          <div className="w-full border-t border-accent my-4"></div>
          <div className="flex flex-row justify-between items-center w-full">
            <h4 className="font-semibold">Total Invested</h4>
            <div className="flex flex-row justify-start items-center gap-2">
              <Image
                src={getTokenInfo(Number(chainId), investment.token)?.icon!}
                alt="From Token"
                width={20}
                height={20}
              />
              <div className="font-semibold text-red-500">
                - 
                {fixDecimal(
                  formatUnits(
                    investment.limitAmount * BigInt(jobExecution.totalExecutions),
                    getTokenInfo(Number(chainId), investment.token)?.decimals
                  ),
                  4
                )}
              </div>
              <div className="font-semibold">
                {getTokenInfo(Number(chainId), investment.token)?.name}
              </div>
            </div>
          </div>
          <div className="flex flex-row justify-between items-center w-full">
            <h4 className="font-semibold">Total Bought</h4>
            <div className="flex flex-row justify-start items-center gap-2">
              <Image
                src={getTokenInfo(Number(chainId), investment.targetToken)?.icon!}
                alt="To Token"
                width={20}
                height={20}
              />
              <div className="font-semibold text-green-500">
                + {fixDecimal(
                  formatUnits(
                    jobExecution.totalTargetToken,
                    getTokenInfo(Number(chainId), investment.targetToken)?.decimals
                  ),
                  4
                )}
              </div>
              <div className="font-semibold">
                {getTokenInfo(Number(chainId), investment.targetToken)?.name}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}